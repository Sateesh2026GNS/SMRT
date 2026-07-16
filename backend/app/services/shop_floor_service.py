"""Shop floor — live grid, KPIs, alerts, timeline."""

from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.machine import Machine
from app.models.product import Product
from app.models.production import Batch, DailyProductionReport, ProductionOrder, WorkOrder
from app.models.user import User
from app.schemas.shop_floor import (
    ShopFloorAlertRead,
    ShopFloorGridRowRead,
    ShopFloorSummaryRead,
    ShopFloorTimelineBlockRead,
)

ACTIVE_WO = ("planned", "in_progress", "running", "material_ready", "machine_ready")
RUNNING_WO = ("in_progress", "running")


def get_shop_floor_summary(db: Session, tenant_id: int) -> ShopFloorSummaryRead:
    today = date.today()
    running_jobs = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(RUNNING_WO),
            )
        ) or 0
    )
    active_machines = int(
        db.scalar(
            select(func.count(Machine.id)).where(
                Machine.tenant_id == tenant_id,
                Machine.status.in_(("running", "active")),
            )
        ) or 0
    )
    operators = int(
        db.scalar(
            select(func.count(func.distinct(WorkOrder.assigned_user_id))).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(RUNNING_WO),
                WorkOrder.assigned_user_id.isnot(None),
            )
        ) or 0
    )
    reports = list(
        db.scalars(
            select(DailyProductionReport).where(
                DailyProductionReport.tenant_id == tenant_id,
                DailyProductionReport.report_date == today,
            )
        ).all()
    )
    todays_production = int(
        db.scalar(
            select(func.count(ProductionOrder.id)).where(
                ProductionOrder.tenant_id == tenant_id,
                func.date(ProductionOrder.start_date) == today,
            )
        ) or 0
    )

    report_target = int(sum(float(r.planned_quantity or 0) for r in reports))
    prod_planned = db.scalar(
        select(func.sum(ProductionOrder.planned_quantity)).where(
            ProductionOrder.tenant_id == tenant_id,
            func.date(ProductionOrder.start_date) == today
        )
    ) or 0.0
    wo_planned = db.scalar(
        select(func.sum(WorkOrder.planned_quantity)).where(
            WorkOrder.tenant_id == tenant_id,
            (func.date(WorkOrder.planned_start) == today) | (
                (WorkOrder.planned_start.is_(None)) & (func.date(WorkOrder.updated_at) == today)
            )
        )
    ) or 0.0
    todays_target = int(max(report_target, prod_planned, wo_planned))
    scrap_qty = int(sum(float(r.scrap_quantity or 0) for r in reports))
    downtime = int(sum(r.downtime_minutes or 0 for r in reports))
    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all())
    running = sum(1 for m in machines if m.status in ("running", "active"))
    oee = round(running / len(machines) * 100, 1) if machines else 0

    return ShopFloorSummaryRead(
        running_jobs=running_jobs,
        active_machines=active_machines,
        operators_working=operators,
        todays_production=todays_production,
        todays_target=todays_target,
        scrap_qty=scrap_qty,
        downtime_minutes=downtime,
        oee_pct=oee,
    )


def get_shop_floor_grid(db: Session, tenant_id: int) -> list[ShopFloorGridRowRead]:
    machines = list(
        db.scalars(select(Machine).where(Machine.tenant_id == tenant_id).order_by(Machine.code)).all()
    )
    rows = []
    for m in machines:
        wo = db.scalars(
            select(WorkOrder)
            .where(
                WorkOrder.machine_id == m.id,
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(ACTIVE_WO),
            )
            .order_by(WorkOrder.id.desc())
        ).first()
        product_name = None
        operator_name = None
        progress = 0
        wo_num = None
        wo_id = None
        shift = None
        status = m.status or "idle"
        if wo:
            wo_id = wo.id
            wo_num = wo.work_order_number
            shift = wo.shift
            po = db.get(ProductionOrder, wo.production_order_id)
            if po:
                product = db.get(Product, po.product_id)
                product_name = product.name if product else None
            if wo.assigned_user_id:
                user = db.get(User, wo.assigned_user_id)
                operator_name = user.full_name if user else None
            planned = float(wo.planned_quantity or 0)
            actual = float(wo.actual_quantity or 0)
            progress = round(actual / planned * 100, 1) if planned else 0
            status = wo.status if wo.status in RUNNING_WO else m.status
        rows.append(
            ShopFloorGridRowRead(
                machine_id=m.id,
                machine_name=m.name,
                work_order_id=wo_id,
                work_order_number=wo_num,
                product_name=product_name,
                operator_name=operator_name,
                shift=shift,
                progress_pct=progress,
                status=status,
            )
        )
    return rows


def get_shop_floor_alerts(db: Session, tenant_id: int) -> list[ShopFloorAlertRead]:
    alerts = []
    down = list(
        db.scalars(
            select(Machine).where(
                Machine.tenant_id == tenant_id,
                Machine.status.in_(("breakdown", "maintenance", "down")),
            )
        ).all()
    )
    for m in down:
        alerts.append(
            ShopFloorAlertRead(
                alert_type="machine_breakdown",
                message=f"{m.name} Breakdown",
                severity="error",
            )
        )
    shortages = db.scalar(
        select(func.count(WorkOrder.id)).where(
            WorkOrder.tenant_id == tenant_id,
            WorkOrder.status == "material_ready",
        )
    )
    if shortages:
        alerts.append(
            ShopFloorAlertRead(
                alert_type="material_shortage",
                message="Material Shortage",
                severity="warning",
            )
        )
    return alerts[:6]


def get_shop_floor_timeline(db: Session, tenant_id: int) -> list[ShopFloorTimelineBlockRead]:
    wos = list(
        db.scalars(
            select(WorkOrder)
            .where(WorkOrder.tenant_id == tenant_id, WorkOrder.status.in_(RUNNING_WO))
            .limit(3)
        ).all()
    )
    slots = ["08 AM", "10 AM", "12 PM"]
    blocks = []
    for i, wo in enumerate(wos):
        po = db.get(ProductionOrder, wo.production_order_id)
        product = db.get(Product, po.product_id) if po else None
        blocks.append(
            ShopFloorTimelineBlockRead(
                slot=slots[i % len(slots)],
                label=product.name if product else "Production",
                product_name=product.name if product else "—",
                span_slots=3 - i,
            )
        )
    return blocks
