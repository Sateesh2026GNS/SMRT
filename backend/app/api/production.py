from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.production import (
    BatchCreate,
    BatchRead,
    DailyProductionReportCreate,
    DailyProductionReportRead,
    MachineCreate,
    MachineRead,
    MachineStatusEventCreate,
    MachineStatusEventRead,
    MachineUpdate,
    ProductRead,
    ProductionOrderCreate,
    ProductionOrderRead,
    WorkOrderCreate,
    WorkOrderRead,
    WorkOrderQuickCreate,
    WorkOrderUpdate,
)
from app.services.production_service import (
    create_batch,
    create_daily_production_report,
    create_machine,
    create_machine_status_event,
    create_production_order,
    create_work_order,
    list_batches,
    list_daily_production_reports,
    list_machine_status_events,
    list_machines,
    list_production_orders,
    list_products,
    list_work_orders,
    update_machine_status,
    update_work_order,
)

router = APIRouter(prefix="/production", tags=["production"])


@router.post("/seed-products")
def seed_products_endpoint():
    """Dev endpoint to seed sample products for tenant 1."""
    from app.core.database import SessionLocal
    from app.core.seed_products import seed_products
    from app.core.seed_tenant import seed_tenant

    db = SessionLocal()
    try:
        seed_tenant(db)
        seed_products(db)
        return {"status": "ok", "message": "Products seeded for tenant 1"}
    finally:
        db.close()


@router.get("/products", response_model=list[ProductRead])
def list_products_endpoint(
    tenant_id: int = Query(...), db: Session = Depends(get_db)
) -> list[ProductRead]:
    return list_products(db, tenant_id)


@router.post("/orders", response_model=ProductionOrderRead)
def create_production_order_endpoint(
    payload: ProductionOrderCreate, db: Session = Depends(get_db)
) -> ProductionOrderRead:
    return create_production_order(db, payload)


@router.get("/orders", response_model=list[ProductionOrderRead])
def list_production_orders_endpoint(
    tenant_id: int = Query(...), db: Session = Depends(get_db)
) -> list[ProductionOrderRead]:
    return list_production_orders(db, tenant_id)


@router.post("/work-orders", response_model=WorkOrderRead)
def create_work_order_endpoint(
    payload: WorkOrderCreate, db: Session = Depends(get_db)
) -> WorkOrderRead:
    return create_work_order(db, payload)


@router.post("/work-orders/quick", response_model=WorkOrderRead)
def quick_create_work_order_endpoint(
    payload: WorkOrderQuickCreate, db: Session = Depends(get_db)
) -> WorkOrderRead:
    from app.services.production_service import quick_create_work_order

    return quick_create_work_order(db, payload)


@router.patch("/work-orders/{work_order_id}", response_model=WorkOrderRead)
def update_work_order_endpoint(
    work_order_id: int,
    payload: WorkOrderUpdate,
    tenant_id: int = Query(...),
    db: Session = Depends(get_db),
) -> WorkOrderRead:
    wo = update_work_order(
        db, work_order_id, tenant_id,
        actual_quantity=payload.actual_quantity,
        status=payload.status,
        machine_id=payload.machine_id,
    )
    if not wo:
        from fastapi import HTTPException
        raise HTTPException(404, "Work order not found")
    return wo


@router.get("/work-orders", response_model=list[WorkOrderRead])
def list_work_orders_endpoint(
    tenant_id: int = Query(...),
    production_order_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[WorkOrderRead]:
    return list_work_orders(db, tenant_id, production_order_id)


@router.post("/batches", response_model=BatchRead)
def create_batch_endpoint(
    payload: BatchCreate, db: Session = Depends(get_db)
) -> BatchRead:
    return create_batch(db, payload)


@router.get("/batches", response_model=list[BatchRead])
def list_batches_endpoint(
    tenant_id: int = Query(...),
    work_order_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[BatchRead]:
    return list_batches(db, tenant_id, work_order_id)


@router.post("/machines", response_model=MachineRead)
def create_machine_endpoint(
    payload: MachineCreate, db: Session = Depends(get_db)
) -> MachineRead:
    return create_machine(db, payload)


@router.patch("/machines/{machine_id}", response_model=MachineRead)
def update_machine_endpoint(
    machine_id: int,
    payload: MachineUpdate,
    tenant_id: int = Query(...),
    db: Session = Depends(get_db),
) -> MachineRead:
    m = update_machine_status(db, machine_id, tenant_id, payload.status)
    if not m:
        from fastapi import HTTPException
        raise HTTPException(404, "Machine not found")
    return m


@router.get("/machines", response_model=list[MachineRead])
def list_machines_endpoint(
    tenant_id: int = Query(...), db: Session = Depends(get_db)
) -> list[MachineRead]:
    return list_machines(db, tenant_id)


@router.post("/machine-status", response_model=MachineStatusEventRead)
def create_machine_status_event_endpoint(
    payload: MachineStatusEventCreate, db: Session = Depends(get_db)
) -> MachineStatusEventRead:
    return create_machine_status_event(db, payload)


@router.get("/machine-status", response_model=list[MachineStatusEventRead])
def list_machine_status_events_endpoint(
    tenant_id: int = Query(...),
    machine_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[MachineStatusEventRead]:
    return list_machine_status_events(db, tenant_id, machine_id)


@router.post("/daily-reports", response_model=DailyProductionReportRead)
def create_daily_production_report_endpoint(
    payload: DailyProductionReportCreate, db: Session = Depends(get_db)
) -> DailyProductionReportRead:
    return create_daily_production_report(db, payload)


@router.get("/daily-reports", response_model=list[DailyProductionReportRead])
def list_daily_production_reports_endpoint(
    tenant_id: int = Query(...),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    work_order_id: int | None = Query(None),
    machine_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[DailyProductionReportRead]:
    return list_daily_production_reports(
        db,
        tenant_id,
        date_from=date_from,
        date_to=date_to,
        work_order_id=work_order_id,
        machine_id=machine_id,
    )
