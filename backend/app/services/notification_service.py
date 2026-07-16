"""Legacy shim — delegates to notification_management_service."""

<<<<<<< HEAD
from app.services.notification_management_service import (  # noqa: F401
    NotificationManagementService,
    clear_all_notifications,
    get_user_notifications,
    mark_notifications_read,
)
=======
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import user_has_permission, user_is_admin
from app.models.alert import Alert
from app.models.machine import Machine
from app.models.notification import UserNotificationState
from app.models.production import WorkOrder
from app.models.user import User


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _item(
    *,
    item_id: str,
    category: str,
    title: str,
    message: str,
    severity: str = "medium",
    link: str = "/production/work-orders",
    triggered_at: str | None = None,
) -> dict:
    return {
        "id": item_id,
        "type": category,
        "category": category,
        "category_label": category.replace("_", " ").title(),
        "title": title,
        "message": message,
        "severity": severity,
        "triggered_at": triggered_at or _now_iso(),
        "link": link,
    }


def _demo_notifications(user: User) -> list[dict]:
    now = _now_iso()
    demos: list[dict] = []
    if _can_see(user, "production"):
        demos.extend([
            _item(
                item_id="demo_machine_down",
                category="machine_down",
                title="CNC-03",
                message="Machine reported breakdown",
                severity="critical",
                link="/production/machines",
                triggered_at=now,
            ),
            _item(
                item_id="demo_order_delay",
                category="order_delay",
                title="WO-1025",
                message="Work order delayed — planned end was 04 Jul 2026",
                severity="high",
                link="/production/work-orders",
                triggered_at=now,
            ),
        ])
    if _can_see(user, "hr"):
        demos.append(
            _item(
                item_id="demo_leave_request",
                category="leave_request",
                title="Leave request",
                message="Ravi Kumar requested 2 days casual leave",
                severity="medium",
                link="/hr/leave",
                triggered_at=now,
            )
        )
    if _can_see(user, "accounts", "sales"):
        demos.append(
            _item(
                item_id="demo_payment_due",
                category="payment_due",
                title="Invoice INV-1042",
                message="Customer payment due in 3 days",
                severity="high",
                link="/sales/invoices",
                triggered_at=now,
            )
        )
    if _can_see(user, "inventory", "procurement"):
        demos.append(
            _item(
                item_id="demo_low_stock",
                category="low_stock",
                title="Steel Rod 12mm",
                message="Stock below reorder level — 8 units remaining",
                severity="high",
                link="/inventory/materials",
                triggered_at=now,
            )
        )
    if _can_see(user, "maintenance"):
        demos.append(
            _item(
                item_id="demo_maintenance_due",
                category="maintenance_due",
                title="VMC-01",
                message="Preventive maintenance scheduled for tomorrow",
                severity="medium",
                link="/maintenance/preventive",
                triggered_at=now,
            )
        )
    return demos


def _can_see(user: User, *modules: str) -> bool:
    return user_is_admin(user) or any(user_has_permission(user, m) for m in modules)


def _append_machine_down(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "production"):
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
                link="/production/machines",
            )
        )


def _append_order_delay(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "production"):
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
                link="/production/work-orders",
                triggered_at=wo.planned_end.isoformat() if wo.planned_end else None,
            )
        )


def _badge_count(items: list[dict]) -> int:
    return sum(1 for item in items if not item.get("read"))


def _load_user_states(db: Session, user_id: int, keys: list[str]) -> dict[str, str]:
    if not keys:
        return {}
    rows = db.scalars(
        select(UserNotificationState).where(
            UserNotificationState.user_id == user_id,
            UserNotificationState.notification_key.in_(keys),
        )
    ).all()
    return {row.notification_key: row.status for row in rows}


def _apply_user_states(items: list[dict], states: dict[str, str]) -> list[dict]:
    visible: list[dict] = []
    for item in items:
        status = states.get(item["id"])
        if status == "cleared":
            continue
        visible.append({**item, "read": status == "read"})
    return visible


def _upsert_states(db: Session, user: User, keys: list[str], status: str) -> None:
    for key in keys:
        row = db.scalar(
            select(UserNotificationState).where(
                UserNotificationState.user_id == user.id,
                UserNotificationState.notification_key == key,
            )
        )
        if row:
            if row.status != "cleared" or status == "cleared":
                row.status = status
        else:
            db.add(
                UserNotificationState(
                    user_id=user.id,
                    tenant_id=user.tenant_id,
                    notification_key=key,
                    status=status,
                )
            )
    db.commit()


def _append_active_alerts(db: Session, user: User, items: list[dict]) -> None:
    if not _can_see(user, "alerts"):
        return
    alerts = db.scalars(
        select(Alert).where(
            Alert.tenant_id == user.tenant_id,
            Alert.status == "active",
        ).order_by(Alert.triggered_at.desc())
    ).all()
    for alert in alerts[:8]:
        link = "/alerts"
        if alert.alert_type == "low_stock":
            link = "/inventory/materials"
        elif alert.alert_type in ("machine_failure", "maintenance"):
            link = "/maintenance/breakdowns"
        elif alert.alert_type == "production_delay":
            link = "/production/work-orders"
        items.append(
            _item(
                item_id=f"alert_{alert.id}",
                category=alert.alert_type,
                title=alert.title,
                message=alert.message or alert.title,
                severity=alert.severity or "medium",
                link=link,
                triggered_at=alert.triggered_at.isoformat() if alert.triggered_at else None,
            )
        )


def _collect_notification_items(db: Session, user: User) -> list[dict]:
    items: list[dict] = []
    _append_active_alerts(db, user, items)
    _append_machine_down(db, user, items)
    _append_order_delay(db, user, items)
    items.sort(key=lambda x: x.get("triggered_at") or "", reverse=True)
    return items[:20]


def get_user_notifications(db: Session, user: User) -> dict:
    items = _collect_notification_items(db, user)
    states = _load_user_states(db, user.id, [i["id"] for i in items])
    visible = _apply_user_states(items, states)
    return {"count": _badge_count(visible), "notifications": visible}


def mark_notifications_read(
    db: Session, user: User, notification_ids: list[str] | None = None
) -> dict:
    items = _collect_notification_items(db, user)
    states = _load_user_states(db, user.id, [i["id"] for i in items])
    visible = _apply_user_states(items, states)
    if notification_ids:
        to_mark = [i["id"] for i in visible if i["id"] in notification_ids and not i.get("read")]
    else:
        to_mark = [i["id"] for i in visible if not i.get("read")]
    if to_mark:
        _upsert_states(db, user, to_mark, "read")
    return get_user_notifications(db, user)


def clear_all_notifications(db: Session, user: User) -> dict:
    items = _collect_notification_items(db, user)
    states = _load_user_states(db, user.id, [i["id"] for i in items])
    visible = _apply_user_states(items, states)
    keys = [i["id"] for i in visible]
    if keys:
        _upsert_states(db, user, keys, "cleared")
    return get_user_notifications(db, user)
>>>>>>> 42502626 (first commit)
