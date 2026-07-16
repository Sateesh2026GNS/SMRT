from datetime import date, datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.machine import Machine, MachineStatusEvent
from app.models.product import Product
from app.models.production import (
    Batch,
    DailyProductionReport,
    ProductionOrder,
    WorkOrder,
)
from app.models.user import User
from app.services.data_scope import (
    operator_can_access_work_order,
    production_manager_plant,
    scope_daily_reports,
    scope_work_orders,
)
from app.schemas.production import (
    BatchCreate,
    DailyProductionReportCreate,
    MachineCreate,
    MachineStatusEventCreate,
    ProductionOrderCreate,
    ProductionOrderUpdate,
    WorkOrderCreate,
    WorkOrderQuickCreate,
)


def list_products(db: Session, tenant_id: int) -> list[Product]:
    stmt = select(Product).where(Product.tenant_id == tenant_id).order_by(Product.name)
    return list(db.scalars(stmt).all())


def create_production_order(db: Session, payload: ProductionOrderCreate) -> ProductionOrder:
    stmt = select(ProductionOrder).where(
        ProductionOrder.tenant_id == payload.tenant_id,
        ProductionOrder.order_number == payload.order_number.strip(),
    )
    existing = db.scalars(stmt).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Order number '{payload.order_number}' already exists.",
        )
    order = ProductionOrder(**payload.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def update_production_order(
    db: Session, order_id: int, tenant_id: int, payload: ProductionOrderUpdate
) -> ProductionOrder | None:
    order = db.scalars(
        select(ProductionOrder).where(
            ProductionOrder.id == order_id, ProductionOrder.tenant_id == tenant_id
        )
    ).first()
    if not order:
        return None
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order


def list_production_orders(db: Session, tenant_id: int) -> list[ProductionOrder]:
    stmt = (
        select(ProductionOrder)
        .where(ProductionOrder.tenant_id == tenant_id)
        .order_by(ProductionOrder.id.desc())
    )
    return list(db.scalars(stmt).all())


def update_production_order_status(
    db: Session, order_id: int, tenant_id: int, status: str
) -> ProductionOrder | None:
    order = db.scalars(
        select(ProductionOrder).where(
            ProductionOrder.id == order_id, ProductionOrder.tenant_id == tenant_id
        )
    ).first()
    if not order:
        return None
    previous_status = order.status
    order.status = status
    if status == "completed" and previous_status != "completed":
        _receive_finished_goods_on_completion(db, order)
    db.commit()
    db.refresh(order)
    return order


def _completed_quantity(order: ProductionOrder, work_orders: list[WorkOrder]) -> int:
    if work_orders:
        total = sum(float(wo.actual_quantity or 0) for wo in work_orders)
        if total > 0:
            return int(total)
    return int(float(order.planned_quantity or 0))


def _receive_finished_goods_on_completion(db: Session, order: ProductionOrder) -> None:
    """Inventory module removed — production completion no longer posts stock movements."""
    return


def create_work_order(db: Session, payload: WorkOrderCreate, assigned_user_id: int | None = None) -> WorkOrder:
    data = payload.model_dump()
    if assigned_user_id is not None:
        data["assigned_user_id"] = assigned_user_id
    work_order = WorkOrder(**data)
    db.add(work_order)
    db.commit()
    db.refresh(work_order)

    # Create corresponding batch
    clean_num = work_order.work_order_number.replace("WO-", "")
    batch = Batch(
        tenant_id=work_order.tenant_id,
        work_order_id=work_order.id,
        batch_code=f"BAT-{clean_num}",
        quantity=work_order.planned_quantity,
        status=work_order.status,
    )
    db.add(batch)
    db.commit()

    return work_order


def quick_create_work_order(db: Session, payload: WorkOrderQuickCreate) -> WorkOrder:
    """Create production order + work order in one call (3-field UX)."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    order_number = f"PO-Q-{ts}"
    prod_order = ProductionOrder(
        tenant_id=payload.tenant_id,
        product_id=payload.product_id,
        order_number=order_number,
        planned_quantity=payload.planned_quantity,
        status="planned",
    )
    db.add(prod_order)
    db.flush()

    wo_number = f"WO-{ts}"
    work_order = WorkOrder(
        tenant_id=payload.tenant_id,
        production_order_id=prod_order.id,
        machine_id=payload.machine_id,
        work_order_number=wo_number,
        planned_quantity=payload.planned_quantity,
        status="planned",
        plant_code=getattr(payload, "plant_code", None),
    )
    db.add(work_order)
    db.commit()
    db.refresh(work_order)

    # Create corresponding batch
    clean_num = work_order.work_order_number.replace("WO-", "")
    batch = Batch(
        tenant_id=work_order.tenant_id,
        work_order_id=work_order.id,
        batch_code=f"BAT-{clean_num}",
        quantity=work_order.planned_quantity,
        status=work_order.status,
    )
    db.add(batch)
    db.commit()

    return work_order


def list_work_orders(
    db: Session,
    tenant_id: int,
    production_order_id: int | None = None,
    user: User | None = None,
) -> list[WorkOrder]:
    stmt = select(WorkOrder).where(WorkOrder.tenant_id == tenant_id)
    if production_order_id is not None:
        stmt = stmt.where(WorkOrder.production_order_id == production_order_id)
    if user is not None:
        stmt = scope_work_orders(stmt, user)
    return list(db.scalars(stmt).all())


def get_work_order(db: Session, work_order_id: int, tenant_id: int) -> WorkOrder | None:
    return db.scalars(
        select(WorkOrder).where(WorkOrder.id == work_order_id, WorkOrder.tenant_id == tenant_id)
    ).first()


def update_work_order(
    db: Session, work_order_id: int, tenant_id: int, user: User | None = None, **kwargs
) -> WorkOrder | None:
    wo = get_work_order(db, work_order_id, tenant_id)
    if not wo:
        return None
    if user is not None and not operator_can_access_work_order(user, wo):
        raise HTTPException(status_code=403, detail="You cannot modify this work order")
    for k, v in kwargs.items():
        if v is not None and hasattr(wo, k):
            setattr(wo, k, v)
    db.commit()
    db.refresh(wo)

    # Sync batch status
    if "status" in kwargs and kwargs["status"] is not None:
        batch = db.scalars(
            select(Batch).where(Batch.work_order_id == wo.id, Batch.tenant_id == tenant_id)
        ).first()
        if batch:
            batch.status = kwargs["status"]
            db.commit()

    return wo


def create_batch(db: Session, payload: BatchCreate) -> Batch:
    batch = Batch(**payload.model_dump())
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


def list_batches(
    db: Session, tenant_id: int, work_order_id: int | None = None
) -> list[Batch]:
    stmt = select(Batch).where(Batch.tenant_id == tenant_id)
    if work_order_id is not None:
        stmt = stmt.where(Batch.work_order_id == work_order_id)
    return list(db.scalars(stmt).all())


def create_machine(db: Session, payload: MachineCreate) -> Machine:
    machine = Machine(**payload.model_dump())
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


def list_machines(db: Session, tenant_id: int, user: User | None = None) -> list[Machine]:
    stmt = select(Machine).where(Machine.tenant_id == tenant_id)
    if user is not None and user.plant_code and "Production Manager" in {r.name for r in user.roles}:
        stmt = stmt.where(
            (Machine.plant_code == user.plant_code) | (Machine.plant_code.is_(None))
        )
    return list(db.scalars(stmt).all())


def update_machine_status(
    db: Session, machine_id: int, tenant_id: int, status: str, user: User | None = None
) -> Machine | None:
    stmt = select(Machine).where(Machine.id == machine_id, Machine.tenant_id == tenant_id)
    m = db.scalars(stmt).first()
    if not m:
        return None
    m.status = status
    db.commit()
    db.refresh(m)
    return m


def create_machine_status_event(
    db: Session, payload: MachineStatusEventCreate
) -> MachineStatusEvent:
    event = MachineStatusEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def list_machine_status_events(
    db: Session, tenant_id: int, machine_id: int | None = None
) -> list[MachineStatusEvent]:
    stmt = select(MachineStatusEvent).where(MachineStatusEvent.tenant_id == tenant_id)
    if machine_id is not None:
        stmt = stmt.where(MachineStatusEvent.machine_id == machine_id)
    return list(db.scalars(stmt).all())


def create_daily_production_report(
    db: Session, payload: DailyProductionReportCreate, created_by_user_id: int | None = None
) -> DailyProductionReport:
    data = payload.model_dump()
    if created_by_user_id is not None:
        data["created_by_user_id"] = created_by_user_id
    report = DailyProductionReport(**data)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def list_daily_production_reports(
    db: Session,
    tenant_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
    work_order_id: int | None = None,
    machine_id: int | None = None,
    user: User | None = None,
) -> list[DailyProductionReport]:
    stmt = select(DailyProductionReport).where(
        DailyProductionReport.tenant_id == tenant_id
    )
    if date_from is not None:
        stmt = stmt.where(DailyProductionReport.report_date >= date_from)
    if date_to is not None:
        stmt = stmt.where(DailyProductionReport.report_date <= date_to)
    if work_order_id is not None:
        stmt = stmt.where(DailyProductionReport.work_order_id == work_order_id)
    if machine_id is not None:
        stmt = stmt.where(DailyProductionReport.machine_id == machine_id)
    if user is not None:
        stmt = scope_daily_reports(stmt, user)
    return list(db.scalars(stmt).all())


def delete_production_order(db: Session, tenant_id: int, order_id: int) -> bool:
    order = db.scalars(
        select(ProductionOrder).where(
            ProductionOrder.id == order_id, ProductionOrder.tenant_id == tenant_id
        )
    ).first()
    if not order:
        return False
    from sqlalchemy import delete
    for wo in order.work_orders:
        db.execute(delete(DailyProductionReport).where(DailyProductionReport.work_order_id == wo.id))
    db.delete(order)
    db.commit()
    return True


def delete_work_order(db: Session, tenant_id: int, work_order_id: int) -> bool:
    wo = db.scalars(
        select(WorkOrder).where(
            WorkOrder.id == work_order_id, WorkOrder.tenant_id == tenant_id
        )
    ).first()
    if not wo:
        return False
    from sqlalchemy import delete
    db.execute(delete(DailyProductionReport).where(DailyProductionReport.work_order_id == work_order_id))
    db.delete(wo)
    db.commit()
    return True
