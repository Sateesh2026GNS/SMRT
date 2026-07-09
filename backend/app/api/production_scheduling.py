from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.models.hr import Shift
from app.models.machine import Machine
from app.models.product import Product
from app.models.production import ProductionOrder, WorkOrder
from app.schemas.schedule import (
    BottomKpiRead,
    MaterialAvailabilityRead,
    ProductionQueueItemRead,
    RescheduleRequest,
    ScheduleConflictRead,
    ScheduleDashboardRead,
    ScheduleTimelineRowRead,
    ShiftScheduleItemRead,
)
from app.services.schedule_service import (
    get_enhanced_timeline,
    get_live_machines,
    get_material_availability,
    get_production_queue,
    get_schedule_conflicts,
    get_schedule_dashboard,
    get_shift_schedule,
    reschedule_work_order,
)

router = APIRouter(prefix="/production-scheduling", tags=["Production Scheduling"])

MODULE = "production"


@router.get("/calendar")
def get_production_calendar(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Production orders as calendar events keyed by their scheduled window."""
    rows = db.execute(
        select(
            ProductionOrder.id,
            ProductionOrder.order_number,
            ProductionOrder.status,
            ProductionOrder.start_date,
            ProductionOrder.due_date,
            ProductionOrder.planned_quantity,
            Product.name,
        )
        .join(Product, ProductionOrder.product_id == Product.id)
        .where(ProductionOrder.tenant_id == tenant_id)
        .order_by(ProductionOrder.start_date)
    ).all()
    return [
        {
            "id": r[0],
            "title": f"{r[1]} - {r[6]}",
            "order_number": r[1],
            "status": r[2],
            "start": r[3].isoformat() if r[3] else None,
            "end": r[4].isoformat() if r[4] else None,
            "planned_quantity": float(r[5] or 0),
            "product": r[6],
        }
        for r in rows
    ]


@router.get("/shift-scheduling")
def get_shift_scheduling(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Configured shifts for the tenant."""
    shifts = list(
        db.scalars(select(Shift).where(Shift.tenant_id == tenant_id).order_by(Shift.start_time)).all()
    )
    return [
        {
            "id": s.id,
            "name": s.name,
            "start_time": s.start_time.isoformat() if s.start_time else None,
            "end_time": s.end_time.isoformat() if s.end_time else None,
            "break_minutes": s.break_minutes,
            "capacity_hours": float(s.capacity_hours or 0),
        }
        for s in shifts
    ]


@router.get("/machine-allocation")
def get_machine_allocation(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """How many work orders are allocated to each machine."""
    machines = list(
        db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all()
    )
    allocation = []
    for m in machines:
        count = db.scalar(
            select(func.count()).select_from(WorkOrder).where(WorkOrder.machine_id == m.id)
        )
        allocation.append(
            {
                "machine_id": m.id,
                "machine": m.name,
                "status": m.status,
                "allocated_work_orders": int(count or 0),
            }
        )
    return allocation


@router.get("/timeline")
def get_production_timeline(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Work-order timeline (Gantt-style rows) for the tenant."""
    rows = db.execute(
        select(
            WorkOrder.id,
            WorkOrder.work_order_number,
            WorkOrder.status,
            WorkOrder.planned_start,
            WorkOrder.planned_end,
            Machine.name,
        )
        .outerjoin(Machine, WorkOrder.machine_id == Machine.id)
        .where(WorkOrder.tenant_id == tenant_id)
        .order_by(WorkOrder.planned_start)
    ).all()
    return [
        {
            "id": r[0],
            "work_order_number": r[1],
            "status": r[2],
            "start": r[3].isoformat() if r[3] else None,
            "end": r[4].isoformat() if r[4] else None,
            "machine": r[5] or "Unassigned",
        }
        for r in rows
    ]


@router.get("/dashboard", response_model=ScheduleDashboardRead)
def get_dashboard(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_schedule_dashboard(db, tenant_id)


@router.get("/live-machines")
def get_live_machine_status(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_live_machines(db, tenant_id)


@router.get("/queue", response_model=list[ProductionQueueItemRead])
def get_queue(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_production_queue(db, tenant_id)


@router.get("/materials", response_model=list[MaterialAvailabilityRead])
def get_materials(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_material_availability(db, tenant_id)


@router.get("/conflicts", response_model=list[ScheduleConflictRead])
def get_conflicts(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_schedule_conflicts(db, tenant_id)


@router.get("/timeline/enhanced", response_model=list[ScheduleTimelineRowRead])
def get_enhanced_timeline_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_enhanced_timeline(db, tenant_id)


@router.get("/shifts", response_model=list[ShiftScheduleItemRead])
def get_shift_schedule_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_shift_schedule(db, tenant_id)


@router.post("/reschedule")
def reschedule_endpoint(
    payload: RescheduleRequest,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    return reschedule_work_order(db, tenant_id, payload)


@router.get("/bottom-kpis", response_model=BottomKpiRead)
def get_bottom_kpis(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    dash = get_schedule_dashboard(db, tenant_id)
    return BottomKpiRead(
        todays_production=dash.completed,
        pending_orders=dash.pending,
        machine_efficiency_pct=dash.machine_utilization_pct,
        shift_efficiency_pct=78.5,
        downtime_minutes=45,
        power_kwh=1240.5,
        oee_pct=82.3,
        quality_rate_pct=96.8,
    )
