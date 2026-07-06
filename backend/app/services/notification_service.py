"""Aggregate in-app notifications for the navbar bell."""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.permissions import user_has_permission, user_is_admin
from app.models.hr import LeaveRequest
from app.models.user import User
from app.services.alert_service import list_alerts, sync_low_stock_alerts
from app.services.approval_service import get_pending_approvals


def get_user_notifications(db: Session, user: User) -> dict:
    items: list[dict] = []

    if user_has_permission(user, "alerts") or user_has_permission(user, "inventory"):
        sync_low_stock_alerts(db, user.tenant_id)
        low_stock = list_alerts(
            db, user.tenant_id, alert_type="low_stock", status="active"
        )
        for alert in low_stock[:10]:
            items.append(
                {
                    "id": f"low_stock_{alert.id}",
                    "type": "low_stock",
                    "title": alert.title,
                    "message": alert.message,
                    "severity": alert.severity,
                    "triggered_at": alert.triggered_at.isoformat()
                    if alert.triggered_at
                    else None,
                    "link": "/alerts/low-stock",
                }
            )

    if user_has_permission(user, "alerts"):
        other_alerts = list_alerts(db, user.tenant_id, status="active")
        for alert in other_alerts:
            if alert.alert_type == "low_stock":
                continue
            items.append(
                {
                    "id": f"alert_{alert.id}",
                    "type": alert.alert_type,
                    "title": alert.title,
                    "message": alert.message,
                    "severity": alert.severity,
                    "triggered_at": alert.triggered_at.isoformat()
                    if alert.triggered_at
                    else None,
                    "link": "/alerts",
                }
            )

    if user_has_permission(user, "hr") and not user_is_admin(user):
        leave_count = db.scalar(
            select(func.count(LeaveRequest.id)).where(
                LeaveRequest.tenant_id == user.tenant_id,
                LeaveRequest.status == "pending",
            )
        ) or 0
        if leave_count > 0:
            now = datetime.now(timezone.utc).isoformat()
            items.append(
                {
                    "id": "hr_leave_pending",
                    "type": "approval",
                    "title": "Pending leave requests",
                    "message": f"{leave_count} leave request(s) awaiting review",
                    "severity": "medium",
                    "triggered_at": now,
                    "link": "/hr/leave",
                    "count": leave_count,
                }
            )

    if user_is_admin(user):
        approvals = get_pending_approvals(db, user.tenant_id)
        approval_items = [
            (
                "leave_requests",
                approvals["leave_requests"],
                "Pending leave requests",
                "/hr/leave",
            ),
            (
                "purchase_orders",
                approvals["purchase_orders"],
                "Pending purchase approvals",
                "/procurement/purchase-orders",
            ),
            (
                "vendors",
                approvals["vendors"],
                "Pending vendor approvals",
                "/procurement/vendors",
            ),
            (
                "production_orders",
                approvals["production_orders"],
                "Pending production orders",
                "/production/planning",
            ),
        ]
        now = datetime.now(timezone.utc).isoformat()
        for key, count, label, link in approval_items:
            if count > 0:
                items.append(
                    {
                        "id": f"approval_{key}",
                        "type": "approval",
                        "title": label,
                        "message": f"{count} item(s) awaiting your approval",
                        "severity": "high",
                        "triggered_at": now,
                        "link": link,
                        "count": count,
                    }
                )

    # Most recent first; approval summaries after dated alerts
    items.sort(
        key=lambda x: x.get("triggered_at") or "",
        reverse=True,
    )

    badge_count = sum(
        1 for i in items if i.get("type") == "low_stock" or i.get("type") not in ("approval",)
    )
    badge_count += sum(i.get("count", 0) for i in items if i.get("type") == "approval")

    return {
        "count": badge_count,
        "notifications": items[:20],
    }
