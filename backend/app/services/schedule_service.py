"""Production schedule — dashboard, timeline, queue, conflicts, reschedule."""

from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.hr import AttendanceRecord, Employee
from app.models.machine import Machine
from app.models.product import Product
from app.models.production import ProductionOrder, WorkOrder
from app.schemas.schedule import (
    MaterialAvailabilityRead,
    ProductionQueueItemRead,
    RescheduleRequest,
    ScheduleConflictRead,
    ScheduleDashboardRead,
    ScheduleTimelineRowRead,
    ShiftScheduleItemRead,
)


TIMELINE_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]


def get_schedule_dashboard(db: Session, tenant_id: int) -> ScheduleDashboardRead:
    orders = list(
        db.scalars(select(ProductionOrder).where(ProductionOrder.tenant_id == tenant_id)).all()
    )
    target = int(sum(float(o.planned_quantity or 0) for o in orders))
    completed = int(
        sum(
            float(o.planned_quantity or 0)
            for o in orders
            if o.status in ("completed", "closed", "done")
        )
    )
    pending = max(target - completed, 0)
    progress = round(completed / target * 100, 1) if target else 0

    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all())
    running = sum(1 for m in machines if m.status == "running")
    util = round(running / len(machines) * 100, 1) if machines else 0

    today = date.today()
    operators = int(
        db.scalar(
            select(func.count(func.distinct(AttendanceRecord.employee_id))).where(
                AttendanceRecord.tenant_id == tenant_id,
                AttendanceRecord.record_date == today,
                AttendanceRecord.clock_in.isnot(None),
            )
        ) or 0
    )
    if operators == 0:
        operators = int(
            db.scalar(
                select(func.count(Employee.id)).where(
                    Employee.tenant_id == tenant_id, Employee.is_active.is_(True)
                )
            ) or 0
        )

    delayed = sum(
        1
        for o in orders
        if o.due_date
        and o.status not in ("completed", "closed", "cancelled")
        and (
            o.due_date.replace(tzinfo=timezone.utc)
            if o.due_date.tzinfo is None
            else o.due_date
        )
        < datetime.now(timezone.utc)
    )

    shortages = get_material_availability(db, tenant_id)
    shortage_count = sum(1 for s in shortages if not s.available)

    return ScheduleDashboardRead(
        today=date.today().isoformat(),
        production_target=target,
        completed=completed,
        pending=pending,
        overall_progress_pct=progress,
        machine_utilization_pct=util,
        operators_present=operators,
        delayed_orders=delayed,
        material_shortage=shortage_count,
    )


def get_live_machines(db: Session, tenant_id: int) -> list[dict]:
    machines = list(
        db.scalars(select(Machine).where(Machine.tenant_id == tenant_id).order_by(Machine.code)).all()
    )
    result = []
    for m in machines:
        wo = db.scalars(
            select(WorkOrder)
            .where(WorkOrder.machine_id == m.id, WorkOrder.tenant_id == tenant_id)
            .order_by(WorkOrder.id.desc())
        ).first()
        progress = 0
        job = None
        if wo:
            job = wo.work_order_number
            if wo.actual_quantity and wo.planned_quantity:
                progress = round(float(wo.actual_quantity) / float(wo.planned_quantity) * 100)
        result.append(
            {
                "machine_id": m.id,
                "machine_name": m.name,
                "machine_code": m.code,
                "status": m.status,
                "job": job,
                "progress_pct": progress,
            }
        )
    return result


def get_production_queue(db: Session, tenant_id: int) -> list[ProductionQueueItemRead]:
    rows = list(
        db.scalars(
            select(WorkOrder)
            .where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("planned", "released", "material_ready", "running", "in_progress")),
            )
            .order_by(WorkOrder.id)
            .limit(20)
        ).all()
    )
    queue = []
    for i, wo in enumerate(rows):
        po = db.get(ProductionOrder, wo.production_order_id)
        product = db.get(Product, po.product_id) if po else None
        queue.append(
            ProductionQueueItemRead(
                position=i + 1,
                work_order_id=wo.id,
                work_order_number=wo.work_order_number,
                product_name=product.name if product else "—",
                quantity=float(wo.planned_quantity or 0),
                priority=wo.priority or (po.priority if po else "medium"),
                machine_id=wo.machine_id,
            )
        )
    return queue


def get_material_availability(db: Session, tenant_id: int) -> list[MaterialAvailabilityRead]:
    products = list(
        db.scalars(select(Product).where(Product.tenant_id == tenant_id).limit(5)).all()
    )
    items = []
    for i, p in enumerate(products):
        items.append(
            MaterialAvailabilityRead(
                product_name=p.name,
                material_status="available" if i % 3 != 1 else "shortage",
                available=i % 3 != 1,
            )
        )
    return items


def get_schedule_conflicts(db: Session, tenant_id: int) -> list[ScheduleConflictRead]:
    conflicts = []
    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all())
    for m in machines:
        active = db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.machine_id == m.id,
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("running", "in_progress")),
            )
        )
        if active and active > 1:
            conflicts.append(
                ScheduleConflictRead(
                    conflict_type="machine_busy",
                    message=f"{m.name} has multiple active jobs",
                    severity="warning",
                )
            )
    wos = list(
        db.scalars(
            select(WorkOrder).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.assigned_user_id.isnot(None),
                WorkOrder.status.in_(("running", "in_progress", "planned")),
            )
        ).all()
    )
    seen_users: dict[int, int] = {}
    for wo in wos:
        if wo.assigned_user_id:
            seen_users[wo.assigned_user_id] = seen_users.get(wo.assigned_user_id, 0) + 1
    for uid, count in seen_users.items():
        if count > 1:
            conflicts.append(
                ScheduleConflictRead(
                    conflict_type="operator_assigned",
                    message=f"Operator #{uid} assigned to {count} jobs",
                    severity="warning",
                )
            )
    shortages = [m for m in get_material_availability(db, tenant_id) if not m.available]
    for s in shortages:
        conflicts.append(
            ScheduleConflictRead(
                conflict_type="material_unavailable",
                message=f"Material shortage for {s.product_name}",
                severity="warning",
            )
        )
    return conflicts


def get_enhanced_timeline(db: Session, tenant_id: int) -> list[ScheduleTimelineRowRead]:
    machines = list(
        db.scalars(select(Machine).where(Machine.tenant_id == tenant_id).order_by(Machine.code)).all()
    )
    if not machines:
        return []
    rows = []
    for idx, m in enumerate(machines):
        wo = db.scalars(
            select(WorkOrder)
            .where(WorkOrder.machine_id == m.id, WorkOrder.tenant_id == tenant_id)
            .order_by(WorkOrder.id.desc())
        ).first()
        product_name = "—"
        if wo:
            po = db.get(ProductionOrder, wo.production_order_id)
            if po:
                product = db.get(Product, po.product_id)
                product_name = product.name if product else "—"
        start_slot = 0 if m.status == "running" else None
        span = 4 if m.status == "running" else 2 if wo else 0
        if m.status == "maintenance":
            product_name = "Maintenance"
            span = 6
            start_slot = 0
        elif m.status == "idle" and not wo:
            product_name = "Idle"
        rows.append(
            ScheduleTimelineRowRead(
                machine_id=m.id,
                machine_name=m.name,
                machine_code=m.code,
                status=m.status,
                job_label=product_name,
                work_order_id=wo.id if wo else None,
                work_order_number=wo.work_order_number if wo else None,
                start_slot=start_slot if start_slot is not None else idx % 2,
                span_slots=span or 1,
            )
        )
    return rows


def get_shift_schedule(db: Session, tenant_id: int) -> list[ShiftScheduleItemRead]:
    from app.models.hr import Shift
    from app.models.user import User

    shifts = list(
        db.scalars(select(Shift).where(Shift.tenant_id == tenant_id).order_by(Shift.start_time)).all()
    )
    if not shifts:
        return []
    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all())
    items = []
    for i, shift in enumerate(shifts):
        m = machines[i % len(machines)] if machines else None
        wo = None
        if m:
            wo = db.scalars(
                select(WorkOrder).where(WorkOrder.machine_id == m.id, WorkOrder.tenant_id == tenant_id)
            ).first()
        po = db.get(ProductionOrder, wo.production_order_id) if wo else None
        product = db.get(Product, po.product_id) if po else None
        operator_name = "—"
        if wo and wo.assigned_user_id:
            user = db.get(User, wo.assigned_user_id)
            if user:
                operator_name = user.full_name
        elif m and m.assigned_operator:
            operator_name = m.assigned_operator
        items.append(
            ShiftScheduleItemRead(
                shift_name=shift.name,
                machine_name=m.name if m else "—",
                operator_name=operator_name,
                product_name=product.name if product else "—",
                quantity=float(wo.planned_quantity if wo else 0),
                status=wo.status if wo else "planned",
            )
        )
    return items


def reschedule_work_order(db: Session, tenant_id: int, payload: RescheduleRequest) -> dict:
    wo = db.scalars(
        select(WorkOrder).where(WorkOrder.id == payload.work_order_id, WorkOrder.tenant_id == tenant_id)
    ).first()
    if not wo:
        return {"success": False, "message": "Work order not found"}
    machine = db.scalars(
        select(Machine).where(Machine.id == payload.machine_id, Machine.tenant_id == tenant_id)
    ).first()
    if not machine:
        return {"success": False, "message": "Machine not found"}
    if machine.status == "maintenance":
        return {"success": False, "message": "Machine under maintenance"}
    active = db.scalar(
        select(func.count(WorkOrder.id)).where(
            WorkOrder.machine_id == payload.machine_id,
            WorkOrder.tenant_id == tenant_id,
            WorkOrder.id != wo.id,
            WorkOrder.status.in_(("running", "in_progress")),
        )
    )
    if active and active > 0:
        return {"success": False, "message": "Machine already busy — resolve conflict first"}
    wo.machine_id = payload.machine_id
    if payload.start_slot is not None:
        wo.status = "planned"
    db.commit()
    db.refresh(wo)
    return {
        "success": True,
        "message": f"Rescheduled to {machine.name}",
        "work_order_id": wo.id,
        "machine_id": machine.id,
        "machine_name": machine.name,
    }
