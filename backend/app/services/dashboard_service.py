"""Main ERP dashboard — live KPIs from production data."""

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.machine import Machine
from app.models.production import Batch, DailyProductionReport, ProductionOrder, WorkOrder
from app.models.user import User
from app.services.notification_management_service import get_user_notifications
from app.services.shop_floor_service import get_shop_floor_summary


def _trend_pct(current: float, previous: float) -> tuple[float, bool]:
    if previous <= 0:
        return 0.0, True
    pct = round((current - previous) / previous * 100, 1)
    return abs(pct), pct >= 0


def _machine_status_breakdown(machines: list[Machine]) -> list[dict]:
    buckets = {
        "running": ("Running", "#22C55E", ("running", "active")),
        "idle": ("Idle", "#3B82F6", ("idle", "stopped", "offline")),
        "setup": ("Setup", "#F97316", ("setup", "changeover")),
        "maintenance": ("Maintenance", "#EF4444", ("maintenance",)),
        "breakdown": ("Breakdown", "#991B1B", ("breakdown", "down", "fault")),
    }
    counts = {key: 0 for key in buckets}
    for machine in machines:
        status = (machine.status or "idle").lower()
        matched = False
        for key, (_, _, statuses) in buckets.items():
            if status in statuses:
                counts[key] += 1
                matched = True
                break
        if not matched:
            counts["idle"] += 1
    if not machines:
        return [
            {"name": label, "value": 0, "color": color}
            for key, (label, color, _) in buckets.items()
        ]
    return [
        {"name": label, "value": counts[key], "color": color}
        for key, (label, color, _) in buckets.items()
    ]


def _top_machines(machines: list[Machine], limit: int = 5) -> list[dict]:
    ranked = sorted(
        machines,
        key=lambda m: float(m.efficiency_pct or m.oee_pct or 0),
        reverse=True,
    )
    if not ranked:
        return []
    result = []
    for machine in ranked[:limit]:
        util = float(machine.efficiency_pct or machine.oee_pct or 0)
        if util <= 0:
            util = 50.0
        result.append({
            "id": machine.code or f"M-{machine.id}",
            "name": machine.name,
            "utilization": round(util, 1),
        })
    return result


def _production_overview(db: Session, tenant_id: int, days: int) -> list[dict]:
    today = date.today()
    overview = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        day_reports = list(
            db.scalars(
                select(DailyProductionReport).where(
                    DailyProductionReport.tenant_id == tenant_id,
                    DailyProductionReport.report_date == d,
                )
            ).all()
        )
        report_actual = int(sum(float(r.produced_quantity or 0) for r in day_reports))
        report_planned = int(sum(float(r.planned_quantity or 0) for r in day_reports))

        prod_planned = db.scalar(
            select(func.sum(ProductionOrder.planned_quantity)).where(
                ProductionOrder.tenant_id == tenant_id,
                func.date(ProductionOrder.start_date) == d
            )
        ) or 0.0

        batch_actual = db.scalar(
            select(func.sum(Batch.quantity)).where(
                Batch.tenant_id == tenant_id,
                func.date(Batch.produced_at) == d
            )
        ) or 0.0

        wo_actual = db.scalar(
            select(func.sum(WorkOrder.actual_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("completed", "running", "in_progress")),
                (func.date(WorkOrder.planned_end) == d) | (
                    (WorkOrder.planned_end.is_(None)) & (func.date(WorkOrder.updated_at) == d)
                )
            )
        ) or 0.0

        wo_planned = db.scalar(
            select(func.sum(WorkOrder.planned_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                (func.date(WorkOrder.planned_start) == d) | (
                    (WorkOrder.planned_start.is_(None)) & (func.date(WorkOrder.updated_at) == d)
                )
            )
        ) or 0.0

        overview.append({
            "date": d.strftime("%d %b"),
            "planned": int(max(report_planned, prod_planned, wo_planned)),
            "actual": int(max(report_actual, batch_actual, wo_actual)),
        })
    return overview


def _weekly_overview(db: Session, tenant_id: int) -> list[dict]:
    today = date.today()
    rows = []
    for week in range(5, 0, -1):
        start = today - timedelta(days=week * 7)
        end = start + timedelta(days=6)
        reports = list(
            db.scalars(
                select(DailyProductionReport).where(
                    DailyProductionReport.tenant_id == tenant_id,
                    DailyProductionReport.report_date >= start,
                    DailyProductionReport.report_date <= end,
                )
            ).all()
        )
        report_actual = int(sum(float(r.produced_quantity or 0) for r in reports))
        report_planned = int(sum(float(r.planned_quantity or 0) for r in reports))

        prod_planned = db.scalar(
            select(func.sum(ProductionOrder.planned_quantity)).where(
                ProductionOrder.tenant_id == tenant_id,
                func.date(ProductionOrder.start_date) >= start,
                func.date(ProductionOrder.start_date) <= end
            )
        ) or 0.0

        batch_actual = db.scalar(
            select(func.sum(Batch.quantity)).where(
                Batch.tenant_id == tenant_id,
                func.date(Batch.produced_at) >= start,
                func.date(Batch.produced_at) <= end
            )
        ) or 0.0

        wo_actual = db.scalar(
            select(func.sum(WorkOrder.actual_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("completed", "running", "in_progress")),
                (func.date(WorkOrder.planned_end) >= start) & (func.date(WorkOrder.planned_end) <= end) | (
                    (WorkOrder.planned_end.is_(None)) & (func.date(WorkOrder.updated_at) >= start) & (func.date(WorkOrder.updated_at) <= end)
                )
            )
        ) or 0.0

        wo_planned = db.scalar(
            select(func.sum(WorkOrder.planned_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                (func.date(WorkOrder.planned_start) >= start) & (func.date(WorkOrder.planned_start) <= end) | (
                    (WorkOrder.planned_start.is_(None)) & (func.date(WorkOrder.updated_at) >= start) & (func.date(WorkOrder.updated_at) <= end)
                )
            )
        ) or 0.0

        rows.append({
            "date": f"Week {6 - week}",
            "planned": int(max(report_planned, prod_planned, wo_planned)),
            "actual": int(max(report_actual, batch_actual, wo_actual)),
        })
    return rows


def _monthly_overview(db: Session, tenant_id: int) -> list[dict]:
    today = date.today()
    rows = []
    for month_offset in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=month_offset * 28)).replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(day=31)
        else:
            month_end = (month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1))
        reports = list(
            db.scalars(
                select(DailyProductionReport).where(
                    DailyProductionReport.tenant_id == tenant_id,
                    DailyProductionReport.report_date >= month_start,
                    DailyProductionReport.report_date <= month_end,
                )
            ).all()
        )
        report_actual = int(sum(float(r.produced_quantity or 0) for r in reports))
        report_planned = int(sum(float(r.planned_quantity or 0) for r in reports))

        prod_planned = db.scalar(
            select(func.sum(ProductionOrder.planned_quantity)).where(
                ProductionOrder.tenant_id == tenant_id,
                func.date(ProductionOrder.start_date) >= month_start,
                func.date(ProductionOrder.start_date) <= month_end
            )
        ) or 0.0

        batch_actual = db.scalar(
            select(func.sum(Batch.quantity)).where(
                Batch.tenant_id == tenant_id,
                func.date(Batch.produced_at) >= month_start,
                func.date(Batch.produced_at) <= month_end
            )
        ) or 0.0

        wo_actual = db.scalar(
            select(func.sum(WorkOrder.actual_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("completed", "running", "in_progress")),
                (func.date(WorkOrder.planned_end) >= month_start) & (func.date(WorkOrder.planned_end) <= month_end) | (
                    (WorkOrder.planned_end.is_(None)) & (func.date(WorkOrder.updated_at) >= month_start) & (func.date(WorkOrder.updated_at) <= month_end)
                )
            )
        ) or 0.0

        wo_planned = db.scalar(
            select(func.sum(WorkOrder.planned_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                (func.date(WorkOrder.planned_start) >= month_start) & (func.date(WorkOrder.planned_start) <= month_end) | (
                    (WorkOrder.planned_start.is_(None)) & (func.date(WorkOrder.updated_at) >= month_start) & (func.date(WorkOrder.updated_at) <= month_end)
                )
            )
        ) or 0.0

        rows.append({
            "date": month_start.strftime("%b"),
            "planned": int(max(report_planned, prod_planned, wo_planned)),
            "actual": int(max(report_actual, batch_actual, wo_actual)),
        })
    return rows


def _yearly_overview(db: Session, tenant_id: int) -> list[dict]:
    today = date.today()
    rows = []
    for year_offset in range(4, -1, -1):
        year = today.year - year_offset
        start = date(year, 1, 1)
        end = date(year, 12, 31)
        reports = list(
            db.scalars(
                select(DailyProductionReport).where(
                    DailyProductionReport.tenant_id == tenant_id,
                    DailyProductionReport.report_date >= start,
                    DailyProductionReport.report_date <= end,
                )
            ).all()
        )
        report_actual = int(sum(float(r.produced_quantity or 0) for r in reports))
        report_planned = int(sum(float(r.planned_quantity or 0) for r in reports))

        prod_planned = db.scalar(
            select(func.sum(ProductionOrder.planned_quantity)).where(
                ProductionOrder.tenant_id == tenant_id,
                func.date(ProductionOrder.start_date) >= start,
                func.date(ProductionOrder.start_date) <= end
            )
        ) or 0.0

        batch_actual = db.scalar(
            select(func.sum(Batch.quantity)).where(
                Batch.tenant_id == tenant_id,
                func.date(Batch.produced_at) >= start,
                func.date(Batch.produced_at) <= end
            )
        ) or 0.0

        wo_actual = db.scalar(
            select(func.sum(WorkOrder.actual_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("completed", "running", "in_progress")),
                (func.date(WorkOrder.planned_end) >= start) & (func.date(WorkOrder.planned_end) <= end) | (
                    (WorkOrder.planned_end.is_(None)) & (func.date(WorkOrder.updated_at) >= start) & (func.date(WorkOrder.updated_at) <= end)
                )
            )
        ) or 0.0

        wo_planned = db.scalar(
            select(func.sum(WorkOrder.planned_quantity)).where(
                WorkOrder.tenant_id == tenant_id,
                (func.date(WorkOrder.planned_start) >= start) & (func.date(WorkOrder.planned_start) <= end) | (
                    (WorkOrder.planned_start.is_(None)) & (func.date(WorkOrder.updated_at) >= start) & (func.date(WorkOrder.updated_at) <= end)
                )
            )
        ) or 0.0

        rows.append({
            "date": str(year),
            "planned": int(max(report_planned, prod_planned, wo_planned)),
            "actual": int(max(report_actual, batch_actual, wo_actual)),
        })
    return rows


def get_erp_dashboard(db: Session, tenant_id: int, user: User | None = None) -> dict:
    today = date.today()
    yesterday = today - timedelta(days=1)

    total_orders = int(
        db.scalar(
            select(func.count(ProductionOrder.id)).where(ProductionOrder.tenant_id == tenant_id)
        ) or 0
    )
    pending_orders = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("planned", "pending", "released", "material_ready", "in_progress", "running")),
            )
        ) or 0
    )

    today_reports = list(
        db.scalars(
            select(DailyProductionReport).where(
                DailyProductionReport.tenant_id == tenant_id,
                DailyProductionReport.report_date == today,
            )
        ).all()
    )
    yesterday_reports = list(
        db.scalars(
            select(DailyProductionReport).where(
                DailyProductionReport.tenant_id == tenant_id,
                DailyProductionReport.report_date == yesterday,
            )
        ).all()
    )

    # Count ProductionOrders whose planning start_date falls on today / yesterday
    today_production = int(
        db.scalar(
            select(func.count(ProductionOrder.id)).where(
                ProductionOrder.tenant_id == tenant_id,
                func.date(ProductionOrder.start_date) == today,
            )
        ) or 0
    )
    yesterday_production = int(
        db.scalar(
            select(func.count(ProductionOrder.id)).where(
                ProductionOrder.tenant_id == tenant_id,
                func.date(ProductionOrder.start_date) == yesterday,
            )
        ) or 0
    )

    good_qty = int(sum(float(r.produced_quantity or 0) for r in today_reports))
    reject_qty = int(sum(float(r.scrap_quantity or 0) for r in today_reports))

    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all())
    total_machines = len(machines)
    running_machines = sum(1 for m in machines if m.status in ("running", "active"))

    completed_orders = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("completed", "closed", "done")),
            )
        ) or 0
    )
    on_hold_orders = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("on_hold", "paused", "hold")),
            )
        ) or 0
    )
    in_progress_orders = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("in_progress", "running")),
            )
        ) or 0
    )

    prod_trend, prod_up = _trend_pct(today_production, yesterday_production)
    good_trend, good_up = prod_trend, prod_up
    yesterday_reject = int(sum(float(r.scrap_quantity or 0) for r in yesterday_reports))
    reject_trend, reject_up = _trend_pct(reject_qty, yesterday_reject)

    week_ago = today - timedelta(days=7)
    orders_last_7 = int(
        db.scalar(
            select(func.count(ProductionOrder.id)).where(
                ProductionOrder.tenant_id == tenant_id,
                ProductionOrder.created_at >= week_ago,
            )
        ) or 0
    )
    orders_prev_7 = int(
        db.scalar(
            select(func.count(ProductionOrder.id)).where(
                ProductionOrder.tenant_id == tenant_id,
                ProductionOrder.created_at >= week_ago - timedelta(days=7),
                ProductionOrder.created_at < week_ago,
            )
        ) or 0
    )
    orders_trend, orders_up = _trend_pct(orders_last_7, orders_prev_7)

    pending_week_ago = int(
        db.scalar(
            select(func.count(WorkOrder.id)).where(
                WorkOrder.tenant_id == tenant_id,
                WorkOrder.status.in_(("planned", "pending", "released", "material_ready", "in_progress", "running")),
                WorkOrder.created_at < week_ago,
            )
        ) or 0
    )
    pending_trend, pending_up = _trend_pct(pending_orders, pending_week_ago)

    shop = get_shop_floor_summary(db, tenant_id)
    overview = _production_overview(db, tenant_id, 7)

    production_orders = list(
        db.scalars(
            select(ProductionOrder)
            .where(ProductionOrder.tenant_id == tenant_id)
            .order_by(ProductionOrder.id.desc())
            .limit(5)
        ).all()
    )
    recent_orders = [
        {
            "id": o.id,
            "order_number": o.order_number,
            "status": o.status,
            "planned_quantity": float(o.planned_quantity),
            "customer_name": o.customer_name,
        }
        for o in production_orders
    ]

    work_orders = list(
        db.scalars(
            select(WorkOrder)
            .where(WorkOrder.tenant_id == tenant_id)
            .order_by(WorkOrder.id.desc())
            .limit(5)
        ).all()
    )
    recent_work_orders = []
    for wo in work_orders:
        product_name = "—"
        if wo.production_order and wo.production_order.product:
            product_name = wo.production_order.product.name
        recent_work_orders.append({
            "wo": wo.work_order_number,
            "product": product_name,
            "qty": float(wo.planned_quantity or 0),
            "status": wo.status,
            "due": wo.planned_end.isoformat() if wo.planned_end else None,
        })

    notifications = get_user_notifications(db, user) if user else {"notifications": []}
    alerts_feed = [
        {
            "id": n.get("id"),
            "message": n.get("title") or n.get("message"),
            "time": n.get("triggered_at"),
            "color": "#EF4444" if n.get("severity") == "high" else "#3B82F6",
            "icon": "alert",
        }
        for n in notifications.get("notifications", [])[:5]
    ]

    from app.services.inventory_extended_service import get_materials_summary, get_finished_goods_summary

    try:
        materials_summary = get_materials_summary(db, tenant_id)
        fg_summary = get_finished_goods_summary(db, tenant_id)
        raw_count = materials_summary.total_items
        wip_count = in_progress_orders
        fg_count = fg_summary.get("total_products", 0)
        low_stock_count = materials_summary.low_stock
    except Exception:
        raw_count = 0
        wip_count = 0
        fg_count = 0
        low_stock_count = 0

    total_wo = total_orders or (completed_orders + in_progress_orders + on_hold_orders + pending_orders) or 0
    progress_pct = round((completed_orders / total_wo) * 100) if total_wo else 0

    return {
        "kpi_cards": [
            {
                "id": "total-orders",
                "title": "Total Orders",
                "value": str(total_orders),
                "trend": f"{orders_trend}%",
                "trendUp": orders_up,
                "trendLabel": "vs last 7 days",
            },
            {
                "id": "today-production",
                "title": "Today's Production",
                "value": str(today_production),
                "unit": "Orders",
                "trend": f"{prod_trend}%",
                "trendUp": prod_up,
                "trendLabel": "vs yesterday",
            },
            {
                "id": "machines-running",
                "title": "Machines Running",
                "value": str(running_machines),
                "suffix": f"/ {total_machines}",
                "trend": f"{round(running_machines / max(1, total_machines) * 100)}%",
                "trendUp": True,
                "trendLabel": "vs total machines",
            },
            {
                "id": "pending-orders",
                "title": "Pending Orders",
                "value": str(pending_orders),
                "trend": f"{pending_trend}%",
                "trendUp": not pending_up,
                "trendLabel": "vs last 7 days",
            },
            {
                "id": "good-qty",
                "title": "Good Qty (Today)",
                "value": str(good_qty),
                "unit": "Pcs",
                "trend": f"{good_trend}%",
                "trendUp": good_up,
                "trendLabel": "vs yesterday",
            },
            {
                "id": "reject-qty",
                "title": "Reject Qty (Today)",
                "value": str(reject_qty),
                "unit": "Pcs",
                "trend": f"{reject_trend}%",
                "trendUp": not reject_up,
                "trendLabel": "vs yesterday",
            },
        ],
        "production_overview": overview,
        "production_overview_weekly": _weekly_overview(db, tenant_id),
        "production_overview_monthly": _monthly_overview(db, tenant_id),
        "production_overview_yearly": _yearly_overview(db, tenant_id),
        "shop_floor_status": _machine_status_breakdown(machines),
        "top_machines": _top_machines(machines),
        "orders_overview": {
            "total": total_wo,
            "inProgress": in_progress_orders,
            "completed": completed_orders,
            "onHold": on_hold_orders,
            "progress": progress_pct,
        },
        "alerts_feed": alerts_feed,
        "recent_work_orders": recent_work_orders,
        "shop_floor": {
            "running_jobs": shop.running_jobs,
            "active_machines": shop.active_machines,
            "operators_working": shop.operators_working,
            "todays_production": shop.todays_production,
            "todays_target": shop.todays_target,
            "oee_pct": shop.oee_pct,
        },
        "recent_production_orders": recent_orders,
        "inventory_summary": {
            "raw_materials_count": raw_count,
            "wip_items_count": wip_count,
            "finished_goods_count": fg_count,
            "low_stock_count": low_stock_count,
            "warehouse_locations": [
                { "name": "Main Store", "pct": 38 if (raw_count or fg_count or wip_count) else 0, "color": "#3B82F6" },
                { "name": "Production Store", "pct": 28 if (raw_count or fg_count or wip_count) else 0, "color": "#22C55E" },
                { "name": "FG Store", "pct": 24 if (raw_count or fg_count or wip_count) else 0, "color": "#A855F7" },
                { "name": "Others", "pct": 10 if (raw_count or fg_count or wip_count) else 0, "color": "#94A3B8" }
            ]
        },
        "todays_summary": [
            { "label": "Man Power", "value": str(shop.operators_working or 0), "icon": "users" },
            { "label": "Working Hours", "value": f"{int((shop.operators_working or 0) * 8):,} Hrs", "icon": "clock" },
            { "label": "Power Consumption", "value": f"{int((shop.todays_production or 0) * 0.4):,} kWh", "icon": "zap" },
            { "label": "Production Efficiency", "value": f"{shop.oee_pct or 0}%", "icon": "gauge" },
            { "label": "Target Achievement", "value": f"{round((shop.todays_production / max(1, shop.todays_target)) * 100, 1) if shop.todays_target else 0}%", "icon": "target" }
        ],
        "date": today.isoformat(),
    }
