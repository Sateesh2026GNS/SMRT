"""Production schedule helpers derived from work orders and machines."""

from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.machine import Machine
from app.models.production import ProductionOrder, WorkOrder
from app.models.user import User
from app.schemas.schedule import ScheduleDashboardRead, ScheduleTimelineRowRead

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

    operators = int(
        db.scalar(
            select(func.count(User.id)).where(
                User.tenant_id == tenant_id,
                User.is_active.is_(True),
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

    return ScheduleDashboardRead(
        today=date.today().isoformat(),
        production_target=target,
        completed=completed,
        pending=pending,
        overall_progress_pct=progress,
        machine_utilization_pct=util,
        operators_present=operators,
        delayed_orders=delayed,
        material_shortage=0,
    )


def get_enhanced_timeline(db: Session, tenant_id: int) -> list[ScheduleTimelineRowRead]:
    machines = list(
        db.scalars(select(Machine).where(Machine.tenant_id == tenant_id).order_by(Machine.code)).all()
    )
    rows: list[ScheduleTimelineRowRead] = []
    for idx, machine in enumerate(machines[:12]):
        wo = db.scalars(
            select(WorkOrder)
            .where(WorkOrder.machine_id == machine.id, WorkOrder.tenant_id == tenant_id)
            .order_by(WorkOrder.id.desc())
        ).first()
        rows.append(
            ScheduleTimelineRowRead(
                machine_id=machine.id,
                machine_name=machine.name,
                machine_code=machine.code,
                status=machine.status,
                job_label=wo.work_order_number if wo else "—",
                work_order_id=wo.id if wo else None,
                work_order_number=wo.work_order_number if wo else None,
                start_slot=idx % len(TIMELINE_SLOTS),
                span_slots=2 if wo else 1,
            )
        )
    return rows
