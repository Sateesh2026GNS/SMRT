"""Seed demo notifications for ERP users."""

from sqlalchemy import select

from app.models.erp_notification import ErpNotification
from app.models.user import User
from app.services.notification_management_service import NotificationManagementService

DEMO_NOTIFICATIONS = [
    {
        "title": "Work Order WO-1025 Delayed",
        "message": "Production work order WO-1025 is behind schedule. Planned end was 04 Jul 2026.",
        "type": "production",
        "priority": "high",
        "module": "production",
        "action_url": "/production/work-orders",
        "created_by": "System",
    },
    {
        "title": "CNC-03 Machine Breakdown",
        "message": "Machine CNC-03 reported a breakdown. Maintenance team has been notified.",
        "type": "maintenance",
        "priority": "critical",
        "module": "maintenance",
        "action_url": "/maintenance/breakdowns",
        "created_by": "System",
    },
    {
        "title": "Low Stock: Steel Rod 12mm",
        "message": "Inventory for Steel Rod 12mm is below reorder level (8 units remaining).",
        "type": "inventory",
        "priority": "high",
        "module": "inventory",
        "action_url": "/inventory/materials",
        "created_by": "System",
    },
    {
        "title": "Invoice INV-1042 Payment Due",
        "message": "Customer payment for invoice INV-1042 is due in 3 days.",
        "type": "finance",
        "priority": "medium",
        "module": "finance",
        "action_url": "/sales/invoices",
        "created_by": "System",
    },
    {
        "title": "Batch QC Report Pending",
        "message": "Final quality report for batch B-2026-0142 is pending approval.",
        "type": "quality",
        "priority": "medium",
        "module": "quality",
        "action_url": "/quality/batch-reports",
        "created_by": "System",
    },
]


def seed_notifications(db, tenant_id: int = 1) -> None:
    users = db.scalars(select(User).where(User.tenant_id == tenant_id, User.is_active.is_(True))).all()
    if not users:
        return

    for user in users:
        existing = db.scalar(
            select(ErpNotification.id).where(
                ErpNotification.tenant_id == tenant_id,
                ErpNotification.user_id == user.id,
            ).limit(1)
        )
        if existing:
            continue

        for spec in DEMO_NOTIFICATIONS:
            NotificationManagementService.create_for_user(
                db,
                tenant_id=tenant_id,
                user_id=user.id,
                **spec,
            )
