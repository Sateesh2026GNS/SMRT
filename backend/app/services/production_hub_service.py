"""Production hub — unified control center dashboard."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.machine import Machine
from app.models.product import Product
from app.models.production import ProductionOrder, WorkOrder
from app.models.user import User
from app.schemas.production_hub import ProductionHubRead

RUNNING = ("running", "in_progress")
ACTIVE_WO = ("planned", "running", "in_progress", "material_ready", "machine_ready")


def get_production_hub(db: Session, tenant_id: int) -> ProductionHubRead:
    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all())
    running_m = sum(1 for m in machines if m.status in ("running", "active"))
    idle_m = sum(1 for m in machines if m.status in ("idle",))
    down_m = sum(1 for m in machines if m.status in ("breakdown", "maintenance", "down"))

    running_jobs = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(RUNNING),
            )
        ) or 0
    )
    in_progress = int(
        db.scalar(
            select(func.count(ProductionOrder.id)).where(
                ProductionOrder.tenant_id == tenant_id,
                ProductionOrder.status.in_(("running", "in_progress", "planned")),
            )
        ) or 0
    )
    completed_today = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("completed", "closed")),
            )
        ) or 0
    )

    total_users = int(
        db.scalar(
            select(func.count(User.id)).where(User.tenant_id == tenant_id, User.is_active.is_(True))
        ) or 0
    )
    present = int(
        db.scalar(
            select(func.count(func.distinct(WorkOrder.assigned_user_id))).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(RUNNING),
                WorkOrder.assigned_user_id.isnot(None),
            )
        ) or 0
    )

    recent = []
    wos = list(
        db.scalars(
            select(WorkOrder)
            .where(WorkOrder.tenant_id == tenant_id, WorkOrder.status.in_(ACTIVE_WO))
            .limit(5)
        ).all()
    )
    for wo in wos:
        po = db.get(ProductionOrder, wo.production_order_id)
        product = db.get(Product, po.product_id) if po else None
        machine = db.get(Machine, wo.machine_id) if wo.machine_id else None
        recent.append(
            {
                "work_order_number": wo.work_order_number,
                "product": product.name if product else "—",
                "machine": machine.name if machine else "Unassigned",
                "status": wo.status,
                "progress_pct": round(
                    float(wo.actual_quantity or 0) / float(wo.planned_quantity or 1) * 100, 1
                ),
            }
        )

    machine_status = [{"name": m.name, "status": m.status, "code": m.code} for m in machines[:8]]

    return ProductionHubRead(
        running_jobs=running_jobs,
        machines_running=running_m,
        machines_idle=idle_m,
        machines_down=down_m,
        production_in_progress=in_progress,
        production_completed_today=completed_today,
        material_shortages=0,
        material_available=0,
        operators_present=present,
        operators_absent=max(total_users - present, 0),
        quality_passed=0,
        quality_failed=0,
        recent_jobs=recent,
        machine_status=machine_status,
    )
