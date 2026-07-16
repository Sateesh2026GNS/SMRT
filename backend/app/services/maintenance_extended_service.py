"""Maintenance extended — preventive, breakdown, history, hub."""

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.machine import Machine
from app.models.maintenance import BreakdownReport, MaintenanceRecord, PreventiveMaintenance
from app.schemas.maintenance_extended import (
    BreakdownEnrichedRead,
    BreakdownSummaryRead,
    MachineHistoryRead,
    MaintenanceHubRead,
    PreventiveSummaryRead,
    PreventiveTaskRead,
    SparePartRead,
    WorkOrderRead,
)


def _fmt_duration(mins: int | None) -> str | None:
    if not mins:
        return None
    if mins >= 60:
        return f"{mins // 60}h {mins % 60}m"
    return f"{mins}m"


def get_preventive_summary(db: Session, tenant_id: int) -> PreventiveSummaryRead:
    today = date.today()
    tasks = list(db.scalars(select(PreventiveMaintenance).where(PreventiveMaintenance.tenant_id == tenant_id)).all())
    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id, Machine.is_active)).all())
    scheduled_today = sum(1 for t in tasks if t.schedule_date == today)
    overdue = sum(1 for t in tasks if t.schedule_date < today and t.status != "completed")
    completed_month = sum(
        1 for t in tasks
        if t.status == "completed" and t.schedule_date.month == today.month and t.schedule_date.year == today.year
    )
    upcoming = sum(1 for t in tasks if t.schedule_date > today and t.status == "scheduled")
    running = sum(1 for m in machines if m.status == "running")
    avail = (running / len(machines) * 100) if machines else 0.0
    return PreventiveSummaryRead(
        total_machines=len(machines),
        scheduled_today=scheduled_today,
        overdue_tasks=overdue,
        completed_this_month=completed_month,
        upcoming_maintenance=upcoming,
        machine_availability_pct=round(avail, 1),
    )


def list_preventive_enriched(db: Session, tenant_id: int) -> list[PreventiveTaskRead]:
    today = date.today()
    tasks = list(
        db.scalars(
            select(PreventiveMaintenance)
            .where(PreventiveMaintenance.tenant_id == tenant_id)
            .order_by(PreventiveMaintenance.schedule_date.desc())
        ).all()
    )
    result = []
    for t in tasks:
        machine = db.get(Machine, t.machine_id)
        is_overdue = t.schedule_date < today and t.status != "completed"
        result.append(
            PreventiveTaskRead(
                id=t.id,
                machine_id=machine.code if machine else str(t.machine_id),
                machine_name=machine.name if machine else f"Machine {t.machine_id}",
                department=t.department or (machine.department if machine else None),
                maintenance_type=t.maintenance_type or "Preventive",
                scheduled_date=t.schedule_date.isoformat() if t.schedule_date else None,
                assigned_engineer=t.assigned_engineer or "Unassigned",
                estimated_duration=_fmt_duration(t.estimated_duration_minutes) or "2h",
                status=t.status,
                next_due_date=(t.next_due_date or t.schedule_date).isoformat() if (t.next_due_date or t.schedule_date) else None,
                is_overdue=is_overdue,
                task_description=t.task_description,
            )
        )
    return result


def get_breakdown_summary(db: Session, tenant_id: int) -> BreakdownSummaryRead:
    breakdowns = list(db.scalars(select(BreakdownReport).where(BreakdownReport.tenant_id == tenant_id)).all())
    active = sum(1 for b in breakdowns if b.status in ("reported", "in_progress", "assigned"))
    pending = sum(1 for b in breakdowns if b.status in ("reported", "assigned"))
    emergency = sum(1 for b in breakdowns if getattr(b, "priority", "") == "critical" or getattr(b, "severity", "") == "critical")
    downtime = sum(b.downtime_minutes or 0 for b in breakdowns) / 60
    resolved_downtime = sum(b.downtime_minutes or 0 for b in breakdowns if b.status == "resolved")
    resolved_count = sum(1 for b in breakdowns if b.status == "resolved")
    mttr = (resolved_downtime / max(1, resolved_count)) / 60 if resolved_count > 0 else 0.0
    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id)).all())
    breakdown_count = sum(1 for m in machines if m.status == "breakdown")
    avail = ((len(machines) - breakdown_count) / len(machines) * 100) if machines else 0.0
    return BreakdownSummaryRead(
        active_breakdowns=active,
        total_downtime_hours=round(downtime, 1),
        avg_repair_time_mttr=round(mttr, 1),
        machine_availability_pct=round(avail, 1),
        pending_repairs=pending,
        emergency_breakdowns=emergency,
    )


def list_breakdowns_enriched(db: Session, tenant_id: int) -> list[BreakdownEnrichedRead]:
    breakdowns = list(
        db.scalars(
            select(BreakdownReport)
            .where(BreakdownReport.tenant_id == tenant_id)
            .order_by(BreakdownReport.reported_at.desc())
        ).all()
    )
    result = []
    for b in breakdowns:
        machine = db.get(Machine, b.machine_id)
        result.append(
            BreakdownEnrichedRead(
                id=b.id,
                breakdown_number=b.breakdown_number or f"BD-{b.id:05d}",
                machine_name=machine.name if machine else f"Machine {b.machine_id}",
                department=b.department or (machine.department if machine else None),
                reported_by=b.reported_by or "Operator",
                reported_time=b.reported_at.isoformat() if b.reported_at else None,
                cause=b.cause or b.description,
                severity=getattr(b, "severity", "medium") or "medium",
                priority=getattr(b, "priority", "medium") or "medium",
                engineer=b.engineer,
                estimated_completion=b.estimated_completion.isoformat() if getattr(b, "estimated_completion", None) else None,
                status=b.status,
                downtime_minutes=b.downtime_minutes,
            )
        )
    return result


def list_machine_history(db: Session, tenant_id: int) -> list[MachineHistoryRead]:
    records = list(
        db.scalars(
            select(MaintenanceRecord)
            .where(MaintenanceRecord.tenant_id == tenant_id)
            .order_by(MaintenanceRecord.maintenance_date.desc())
        ).all()
    )
    breakdowns = list(
        db.scalars(
            select(BreakdownReport)
            .where(BreakdownReport.tenant_id == tenant_id)
            .order_by(BreakdownReport.reported_at.desc())
        ).all()
    )
    result = []
    for r in records:
        machine = db.get(Machine, r.machine_id)
        result.append(
            MachineHistoryRead(
                id=r.id,
                machine_name=machine.name if machine else f"Machine {r.machine_id}",
                activity=r.activity or r.maintenance_type or "Maintenance",
                event_date=r.maintenance_date.isoformat() if r.maintenance_date else None,
                engineer=r.performed_by,
                cost=float(r.cost) if r.cost else None,
                spare_parts=r.spare_parts,
                downtime_minutes=r.downtime_minutes,
                remarks=r.remarks or r.description,
            )
        )
    for b in breakdowns:
        machine = db.get(Machine, b.machine_id)
        result.append(
            MachineHistoryRead(
                id=b.id + 10000,
                machine_name=machine.name if machine else f"Machine {b.machine_id}",
                activity="Breakdown",
                event_date=b.reported_at.date().isoformat() if b.reported_at else None,
                engineer=b.engineer,
                cost=None,
                spare_parts=None,
                downtime_minutes=b.downtime_minutes,
                remarks=b.cause or b.description,
            )
        )
    return sorted(result, key=lambda x: x.event_date or "", reverse=True)


def get_maintenance_hub(db: Session, tenant_id: int) -> MaintenanceHubRead:
    from app.models.inventory import InventoryItem, StockLevel
    machines = list(db.scalars(select(Machine).where(Machine.tenant_id == tenant_id, Machine.is_active)).all())
    prev_sum = get_preventive_summary(db, tenant_id)
    bd_sum = get_breakdown_summary(db, tenant_id)
    running = sum(1 for m in machines if m.status == "running")
    maintenance = sum(1 for m in machines if m.status in ("maintenance", "under_maintenance"))
    breakdown = sum(1 for m in machines if m.status == "breakdown")
    idle = sum(1 for m in machines if m.status == "idle")
    health_scores = [float(m.health_score or 85) for m in machines]
    health_pct = sum(health_scores) / len(health_scores) if health_scores else 0.0
    
    # Costs
    records = list(db.scalars(select(MaintenanceRecord).where(MaintenanceRecord.tenant_id == tenant_id)).all())
    labour_cost = sum(float(r.cost or 0) for r in records if r.cost and r.activity and "labour" in r.activity.lower())
    spare_cost = sum(float(r.cost or 0) for r in records if r.cost and r.spare_parts)
    external_cost = sum(float(r.cost or 0) for r in records if r.cost and r.activity and "external" in r.activity.lower())
    total_cost = sum(float(r.cost or 0) for r in records)

    # Calendar
    tasks = list(db.scalars(select(PreventiveMaintenance).where(PreventiveMaintenance.tenant_id == tenant_id)).all())
    calendar = []
    for t in tasks:
        mach = db.get(Machine, t.machine_id)
        if t.schedule_date:
            calendar.append({
                "day": t.schedule_date.day,
                "machine": mach.name if mach else f"Machine {t.machine_id}",
                "type": t.maintenance_type or "Preventive"
            })

    # Spare Parts from inventory
    items = list(db.scalars(
        select(InventoryItem)
        .where(
            InventoryItem.tenant_id == tenant_id,
            (InventoryItem.category.ilike("%spare%") | InventoryItem.name.ilike("%spare%") | InventoryItem.sku.ilike("%SP-%"))
        )
    ).all())
    spare_parts_list = []
    for item in items:
        stock_qty = db.scalar(select(func.sum(StockLevel.quantity)).where(StockLevel.item_id == item.id)) or 0
        spare_parts_list.append({
            "part_number": item.sku,
            "spare_name": item.name,
            "stock": int(stock_qty),
            "minimum_stock": item.reorder_level,
            "vendor": item.supplier.name if item.supplier else "Internal",
            "cost": float(item.unit_cost or 0)
        })

    # Work orders
    work_orders_list = []
    active_breakdowns = list(db.scalars(
        select(BreakdownReport)
        .where(
            BreakdownReport.tenant_id == tenant_id,
            BreakdownReport.status.in_(("reported", "assigned", "in_progress"))
        )
    ).all())
    for b in active_breakdowns:
        mach = db.get(Machine, b.machine_id)
        work_orders_list.append({
            "work_order_number": b.breakdown_number or f"MWO-BD-{b.id:04d}",
            "machine": mach.code if mach else f"Machine {b.machine_id}",
            "priority": b.priority or "high",
            "assigned_to": b.engineer or "Unassigned",
            "status": b.status
        })

    active_preventive = list(db.scalars(
        select(PreventiveMaintenance)
        .where(
            PreventiveMaintenance.tenant_id == tenant_id,
            PreventiveMaintenance.status.in_(("scheduled", "in_progress"))
        )
    ).all())
    for p in active_preventive:
        mach = db.get(Machine, p.machine_id)
        work_orders_list.append({
            "work_order_number": f"MWO-PM-{p.id:04d}",
            "machine": mach.code if mach else f"Machine {p.machine_id}",
            "priority": "medium",
            "assigned_to": p.assigned_engineer or "Unassigned",
            "status": p.status
        })

    # Alerts
    alerts_list = []
    today = date.today()
    due_pm = list(db.scalars(
        select(PreventiveMaintenance)
        .where(
            PreventiveMaintenance.tenant_id == tenant_id,
            PreventiveMaintenance.status == "scheduled",
            PreventiveMaintenance.schedule_date <= (today + timedelta(days=2))
        )
    ).all())
    for p in due_pm:
        mach = db.get(Machine, p.machine_id)
        m_name = mach.code if mach else f"Machine {p.machine_id}"
        date_str = "today" if p.schedule_date == today else "tomorrow" if p.schedule_date == today + timedelta(days=1) else p.schedule_date.strftime("%Y-%m-%d")
        alerts_list.append({
            "type": "due",
            "message": f"Preventive maintenance due {date_str} — {m_name}"
        })

    for b in active_breakdowns:
        mach = db.get(Machine, b.machine_id)
        m_name = mach.name if mach else f"Machine {b.machine_id}"
        dt = f" ({b.downtime_minutes / 60:.1f}h downtime)" if b.downtime_minutes else ""
        alerts_list.append({
            "type": "breakdown",
            "message": f"{m_name} breakdown{dt}"
        })

    for item in items:
        stock_qty = db.scalar(select(func.sum(StockLevel.quantity)).where(StockLevel.item_id == item.id)) or 0
        if stock_qty < item.reorder_level:
            alerts_list.append({
                "type": "spare",
                "message": f"Low stock: {item.name} ({int(stock_qty)}/{item.reorder_level})"
            })

    recent_records = list(db.scalars(
        select(MaintenanceRecord)
        .where(MaintenanceRecord.tenant_id == tenant_id)
        .order_by(MaintenanceRecord.maintenance_date.desc())
        .limit(3)
    ).all())
    for r in recent_records:
        mach = db.get(Machine, r.machine_id)
        m_name = mach.name if mach else f"Machine {r.machine_id}"
        by_str = f" by {r.performed_by}" if r.performed_by else ""
        alerts_list.append({
            "type": "completed",
            "message": f"{m_name} maintenance completed{by_str}"
        })

    # Trends
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    downtime_by_month = {m: 0.0 for m in months}
    has_downtime = False
    for b in active_breakdowns:
        if b.reported_at and b.downtime_minutes:
            m_name = months[b.reported_at.month - 1]
            downtime_by_month[m_name] += b.downtime_minutes / 60
            has_downtime = True
    downtime_trend = [{"month": m, "hours": round(downtime_by_month[m], 1)} for m in months] if has_downtime else []

    cost_by_month = {m: 0.0 for m in months}
    has_cost = False
    for r in records:
        if r.maintenance_date and r.cost:
            m_name = months[r.maintenance_date.month - 1]
            cost_by_month[m_name] += float(r.cost)
            has_cost = True
    cost_trend = [{"month": m, "cost": round(cost_by_month[m], 2)} for m in months] if has_cost else []

    breakdown_freq = {m: 0 for m in months}
    has_bf = False
    all_breakdowns = list(db.scalars(select(BreakdownReport).where(BreakdownReport.tenant_id == tenant_id)).all())
    for b in all_breakdowns:
        if b.reported_at:
            m_name = months[b.reported_at.month - 1]
            breakdown_freq[m_name] += 1
            has_bf = True
    breakdown_frequency_trend = [{"month": m, "count": breakdown_freq[m]} for m in months] if has_bf else []

    mttr_by_month = {m: [] for m in months}
    has_mttr = False
    for b in all_breakdowns:
        if b.reported_at and b.status == "resolved" and b.downtime_minutes:
            m_name = months[b.reported_at.month - 1]
            mttr_by_month[m_name].append(b.downtime_minutes / 60)
            has_mttr = True
    mttr_trend = [
        {"month": m, "hours": round(sum(mttr_by_month[m]) / len(mttr_by_month[m]), 1) if mttr_by_month[m] else 0.0}
        for m in months
    ] if has_mttr else []

    return MaintenanceHubRead(
        total_machines=len(machines),
        running=running,
        under_maintenance=maintenance,
        breakdown=breakdown,
        idle=idle,
        machine_health_pct=round(health_pct, 1),
        mttr_hours=bd_sum.avg_repair_time_mttr,
        mtbf_hours=0.0,
        labour_cost=round(labour_cost, 2),
        spare_cost=round(spare_cost, 2),
        external_cost=round(external_cost, 2),
        total_cost=round(total_cost, 2),
        calendar_events=calendar,
        machine_health=[
            {"name": m.name, "health": float(m.health_score or 85), "code": m.code}
            for m in machines[:6]
        ],
        downtime_trend=downtime_trend,
        availability_trend=[],
        cost_trend=cost_trend,
        breakdown_frequency=breakdown_frequency_trend,
        mttr_trend=mttr_trend,
        mtbf_trend=[],
        preventive_vs_breakdown=[
            {"name": "Preventive", "count": prev_sum.completed_this_month},
            {"name": "Breakdown", "count": bd_sum.active_breakdowns},
        ],
        spare_parts=spare_parts_list,
        work_orders=work_orders_list,
        alerts=alerts_list,
    )
