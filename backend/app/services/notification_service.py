"""Aggregate in-app notifications for the navbar bell."""

from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.permissions import user_has_permission, user_is_admin
from app.models.hr import LeaveRequest
from app.models.machine import Machine
from app.models.maintenance import BreakdownReport, MaintenanceSchedule
from app.models.production import WorkOrder
from app.models.sales import Invoice
from app.models.user import User
from app.services.alert_service import list_alerts, sync_low_stock_alerts
from app.services.approval_service import get_pending_approvals

CATEGORY_LABELS = {
    "low_stock": "Low Stock",
    "machine_down": "Machine Down",
    "pending_approval": "Pending Approval",
    "leave_request": "Leave Request",
    "payment_due": "Payment Due",
    "order_delay": "Order Delay",
    "maintenance_due": "Maintenance Due",
}

ALERT_TYPE_LINKS = {
    "low_stock": "/alerts/low-stock",
    "machine_failure": "/alerts/machine-failure",
    "production_delay": "/alerts/production-delay",
    "maintenance": "/alerts/maintenance",
    "maintenance_reminder": "/alerts/maintenance",
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _item(
    *,
    item_id: str,
    category: str,
    title: str,
    message: str,
    severity: str = "medium",
    link: str = "/alerts",
    triggered_at: str | None = None,
    count: int | None = None,
) -> dict:
    return {
        "id": item_id,
        "type": category,
        "category": category,
        "category_label": CATEGORY_LABELS.get(category, category),
        "title": title,
        "message": message,
        "severity": severity,
        "triggered_at": triggered_at or _now_iso(),
        "link": link,
        **({"count": count} if count is not None else {}),
    }


def _demo_notifications() -> list[dict]:
    now = _now_iso()
    return [
        _item(
            item_id="demo_low_stock",
            category="low_stock",
            title="SS Sheet 304",
            message="Stock at 12 units; reorder level is 50",
            severity="high",
            link="/alerts/low-stock",
            triggered_at=now,
        ),
        _item(
            item_id="demo_machine_down",
            category="machine_down",
            title="CNC-03",
            message="Machine reported breakdown — maintenance team notified",
            severity="critical",
            link="/alerts/machine-failure",
            triggered_at=now,
        ),
        _item(
            item_id="demo_pending_approval",
            category="pending_approval",
            title="Purchase orders",
            message="2 purchase orders awaiting your approval",
            severity="high",
            link="/procurement/purchase-orders",
            triggered_at=now,
            count=2,
        ),
        _item(
            item_id="demo_leave_request",
            category="leave_request",
            title="Leave requests",
            message="1 leave request pending HR review",
            severity="medium",
            link="/hr/leave",
            triggered_at=now,
            count=1,
        ),
        _item(
            item_id="demo_payment_due",
            category="payment_due",
            title="INV-1042",
            message="₹1,24,500 overdue — due 28 Jun 2026",
            severity="high",
            link="/sales/invoices",
            triggered_at=now,
        ),
        _item(
            item_id="demo_order_delay",
            category="order_delay",
            title="WO-1025",
            message="Work order delayed — planned end was 04 Jul 2026",
            severity="high",
            link="/alerts/production-delay",
            triggered_at=now,
        ),
        _item(
            item_id="demo_maintenance_due",
            category="maintenance_due",
            title="VMC-01",
            message="Preventive maintenance due today",
            severity="medium",
            link="/alerts/maintenance",
            triggered_at=now,
        ),
    ]


def _can_see(user: User, *modules: str) -> bool:
    return user_is_admin(user) or any(user_has_permission(user, m) for m in modules)


def _append_low_stock(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "alerts", "inventory"):
        return
    sync_low_stock_alerts(db, user.tenant_id)
    for alert in list_alerts(db, user.tenant_id, alert_type="low_stock", status="active")[:8]:
        items.append(
            _item(
                item_id=f"low_stock_{alert.id}",
                category="low_stock",
                title=alert.title.replace("Low stock: ", "") if alert.title else "Low stock",
                message=alert.message or alert.title,
                severity=alert.severity,
                link="/alerts/low-stock",
                triggered_at=alert.triggered_at.isoformat() if alert.triggered_at else None,
            )
        )


def _append_machine_down(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "alerts", "production", "maintenance", "factoryMonitor"):
        return

    machines = db.scalars(
        select(Machine).where(
            Machine.tenant_id == user.tenant_id,
            Machine.is_active.is_(True),
            Machine.status.in_(("breakdown", "down", "fault")),
        )
    ).all()
    for machine in machines[:5]:
        items.append(
            _item(
                item_id=f"machine_down_{machine.id}",
                category="machine_down",
                title=machine.code or machine.name,
                message=f"{machine.name} is down ({machine.status})",
                severity="critical",
                link="/alerts/machine-failure",
            )
        )

    breakdowns = db.scalars(
        select(BreakdownReport).where(
            BreakdownReport.tenant_id == user.tenant_id,
            BreakdownReport.status.in_(("reported", "in_progress")),
        )
    ).all()
    for report in breakdowns[:5]:
        items.append(
            _item(
                item_id=f"breakdown_{report.id}",
                category="machine_down",
                title=f"Breakdown #{report.id}",
                message=report.description or "Machine breakdown reported",
                severity="high",
                link="/maintenance/breakdown",
            )
        )

    for alert in list_alerts(db, user.tenant_id, alert_type="machine_failure", status="active")[:5]:
        items.append(
            _item(
                item_id=f"alert_machine_{alert.id}",
                category="machine_down",
                title=alert.title,
                message=alert.message or alert.title,
                severity=alert.severity,
                link="/alerts/machine-failure",
                triggered_at=alert.triggered_at.isoformat() if alert.triggered_at else None,
            )
        )


def _append_pending_approval(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "admin", "procurement", "production"):
        return
    approvals = get_pending_approvals(db, user.tenant_id)
    approval_rows = [
        ("purchase_orders", approvals["purchase_orders"], "Purchase orders", "/procurement/purchase-orders"),
        ("vendors", approvals["vendors"], "Vendor registrations", "/procurement/vendors"),
        ("production_orders", approvals["production_orders"], "Production orders", "/production/planning"),
    ]
    for key, count, label, link in approval_rows:
        if count > 0:
            items.append(
                _item(
                    item_id=f"approval_{key}",
                    category="pending_approval",
                    title=label,
                    message=f"{count} item(s) awaiting approval",
                    severity="high",
                    link=link,
                    count=count,
                )
            )


def _append_leave_requests(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "hr", "admin"):
        return
    leave_count = db.scalar(
        select(func.count(LeaveRequest.id)).where(
            LeaveRequest.tenant_id == user.tenant_id,
            LeaveRequest.status == "pending",
        )
    ) or 0
    if leave_count > 0:
        items.append(
            _item(
                item_id="leave_requests_pending",
                category="leave_request",
                title="Leave requests",
                message=f"{leave_count} leave request(s) pending review",
                severity="medium",
                link="/hr/leave",
                count=leave_count,
            )
        )


def _append_payment_due(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "accounts", "sales", "admin"):
        return
    today = date.today()
    overdue = db.scalars(
        select(Invoice).where(
            Invoice.tenant_id == user.tenant_id,
            Invoice.due_date.isnot(None),
            Invoice.due_date < today,
            Invoice.grand_total > Invoice.amount_paid,
            Invoice.status.notin_(("paid", "cancelled")),
        ).order_by(Invoice.due_date.asc())
    ).all()
    for inv in overdue[:6]:
        balance = float(inv.grand_total or 0) - float(inv.amount_paid or 0)
        due = inv.due_date.isoformat() if inv.due_date else ""
        items.append(
            _item(
                item_id=f"payment_due_{inv.id}",
                category="payment_due",
                title=inv.invoice_number,
                message=f"₹{balance:,.0f} overdue — due {due}",
                severity="high",
                link="/sales/invoices",
                triggered_at=datetime.combine(inv.due_date, datetime.min.time(), tzinfo=timezone.utc).isoformat()
                if inv.due_date
                else None,
            )
        )


def _append_order_delay(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "production", "alerts", "factoryMonitor"):
        return
    now = datetime.now(timezone.utc)
    delayed = db.scalars(
        select(WorkOrder).where(
            WorkOrder.tenant_id == user.tenant_id,
            WorkOrder.planned_end.isnot(None),
            WorkOrder.planned_end < now,
            WorkOrder.status.notin_(("completed", "cancelled")),
        ).order_by(WorkOrder.planned_end.asc())
    ).all()
    for wo in delayed[:6]:
        planned = wo.planned_end.date().isoformat() if wo.planned_end else ""
        items.append(
            _item(
                item_id=f"order_delay_{wo.id}",
                category="order_delay",
                title=wo.work_order_number,
                message=f"Work order delayed — planned end was {planned}",
                severity="high",
                link="/alerts/production-delay",
                triggered_at=wo.planned_end.isoformat() if wo.planned_end else None,
            )
        )

    for alert in list_alerts(db, user.tenant_id, alert_type="production_delay", status="active")[:4]:
        items.append(
            _item(
                item_id=f"alert_delay_{alert.id}",
                category="order_delay",
                title=alert.title,
                message=alert.message or alert.title,
                severity=alert.severity,
                link="/alerts/production-delay",
                triggered_at=alert.triggered_at.isoformat() if alert.triggered_at else None,
            )
        )


def _append_maintenance_due(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "maintenance", "alerts", "production"):
        return
    today = date.today()
    schedules = db.scalars(
        select(MaintenanceSchedule).where(
            MaintenanceSchedule.tenant_id == user.tenant_id,
            MaintenanceSchedule.is_active.is_(True),
            MaintenanceSchedule.next_due_date <= today,
        ).order_by(MaintenanceSchedule.next_due_date.asc())
    ).all()
    for sched in schedules[:6]:
        due = sched.next_due_date.isoformat()
        items.append(
            _item(
                item_id=f"maintenance_due_{sched.id}",
                category="maintenance_due",
                title=sched.task_name,
                message=f"Maintenance due on {due}",
                severity="medium",
                link="/alerts/maintenance",
                triggered_at=datetime.combine(sched.next_due_date, datetime.min.time(), tzinfo=timezone.utc).isoformat(),
            )
        )

    for alert in list_alerts(
        db, user.tenant_id, alert_type="maintenance_reminder", status="active"
    )[:4]:
        items.append(
            _item(
                item_id=f"alert_maint_{alert.id}",
                category="maintenance_due",
                title=alert.title,
                message=alert.message or alert.title,
                severity=alert.severity,
                link="/alerts/maintenance",
                triggered_at=alert.triggered_at.isoformat() if alert.triggered_at else None,
            )
        )


def _append_other_alerts(db: Session, user: User, items: list[dict], seen_ids: set[str]) -> None:
    if not user_has_permission(user, "alerts"):
        return
    for alert in list_alerts(db, user.tenant_id, status="active"):
        if alert.alert_type in ("low_stock", "machine_failure", "production_delay", "maintenance_reminder"):
            continue
        item_id = f"alert_{alert.id}"
        if item_id in seen_ids:
            continue
        category = alert.alert_type
        items.append(
            _item(
                item_id=item_id,
                category=category,
                title=alert.title,
                message=alert.message or alert.title,
                severity=alert.severity,
                link=ALERT_TYPE_LINKS.get(alert.alert_type, "/alerts"),
                triggered_at=alert.triggered_at.isoformat() if alert.triggered_at else None,
            )
        )


def _badge_count(items: list[dict]) -> int:
    total = 0
    for item in items:
        if item.get("count"):
            total += int(item["count"])
        else:
            total += 1
    return total


def get_user_notifications(db: Session, user: User) -> dict:
    items: list[dict] = []

    _append_low_stock(db, user, items)
    _append_machine_down(db, user, items)
    _append_pending_approval(db, user, items)
    _append_leave_requests(db, user, items)
    _append_payment_due(db, user, items)
    _append_order_delay(db, user, items)
    _append_maintenance_due(db, user, items)

    seen_ids = {i["id"] for i in items}
    _append_other_alerts(db, user, items, seen_ids)

    if not items:
        items = _demo_notifications()

    items.sort(key=lambda x: x.get("triggered_at") or "", reverse=True)

    return {
        "count": _badge_count(items),
        "notifications": items[:20],
    }
