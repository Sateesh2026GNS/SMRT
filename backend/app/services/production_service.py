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
from app.schemas.production import (
    BatchCreate,
    DailyProductionReportCreate,
    MachineCreate,
    MachineStatusEventCreate,
    ProductionOrderCreate,
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


def list_production_orders(db: Session, tenant_id: int) -> list[ProductionOrder]:
    stmt = select(ProductionOrder).where(ProductionOrder.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_work_order(db: Session, payload: WorkOrderCreate) -> WorkOrder:
    work_order = WorkOrder(**payload.model_dump())
    db.add(work_order)
    db.commit()
    db.refresh(work_order)
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
    )
    db.add(work_order)
    db.commit()
    db.refresh(work_order)
    return work_order


def list_work_orders(
    db: Session, tenant_id: int, production_order_id: int | None = None
) -> list[WorkOrder]:
    stmt = select(WorkOrder).where(WorkOrder.tenant_id == tenant_id)
    if production_order_id is not None:
        stmt = stmt.where(WorkOrder.production_order_id == production_order_id)
    return list(db.scalars(stmt).all())


def update_work_order(db: Session, work_order_id: int, tenant_id: int, **kwargs) -> WorkOrder | None:
    stmt = select(WorkOrder).where(
        WorkOrder.id == work_order_id, WorkOrder.tenant_id == tenant_id
    )
    wo = db.scalars(stmt).first()
    if not wo:
        return None
    for k, v in kwargs.items():
        if v is not None and hasattr(wo, k):
            setattr(wo, k, v)
    db.commit()
    db.refresh(wo)
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


def list_machines(db: Session, tenant_id: int) -> list[Machine]:
    stmt = select(Machine).where(Machine.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def update_machine_status(db: Session, machine_id: int, tenant_id: int, status: str) -> Machine | None:
    stmt = select(Machine).where(
        Machine.id == machine_id, Machine.tenant_id == tenant_id
    )
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
    db: Session, payload: DailyProductionReportCreate
) -> DailyProductionReport:
    report = DailyProductionReport(**payload.model_dump())
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
    return list(db.scalars(stmt).all())
