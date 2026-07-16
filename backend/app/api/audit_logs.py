from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.models.security import AccessLog
from app.models.user import User

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

MODULE = "admin"

CHANGE_ACTIONS = ("create", "update", "delete", "patch", "post", "put")


def _serialize(rows):
    return [
        {
            "id": log.id,
            "action": log.action,
            "resource": log.resource,
            "resource_id": log.resource_id,
            "user": full_name or email or "System",
            "ip_address": log.ip_address,
            "logged_at": log.logged_at.isoformat() if log.logged_at else None,
        }
        for log, full_name, email in rows
    ]


@router.get("/user-activity")
def get_user_activity_logs(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Recent access-log activity for the tenant, newest first."""
    rows = db.execute(
        select(AccessLog, User.full_name, User.email)
        .outerjoin(User, AccessLog.user_id == User.id)
        .where(AccessLog.tenant_id == tenant_id)
        .order_by(AccessLog.logged_at.desc())
        .limit(limit)
    ).all()
    return _serialize(rows)


@router.get("/system-changes")
def get_system_changes_logs(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Access-log entries representing data mutations."""
    conditions = [AccessLog.action.ilike(f"%{a}%") for a in CHANGE_ACTIONS]
    rows = db.execute(
        select(AccessLog, User.full_name, User.email)
        .outerjoin(User, AccessLog.user_id == User.id)
        .where(AccessLog.tenant_id == tenant_id, or_(*conditions))
        .order_by(AccessLog.logged_at.desc())
        .limit(limit)
    ).all()
    return _serialize(rows)


@router.get("/login-history")
def get_login_history_logs(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Authentication-related access-log entries."""
    rows = db.execute(
        select(AccessLog, User.full_name, User.email)
        .outerjoin(User, AccessLog.user_id == User.id)
        .where(
            AccessLog.tenant_id == tenant_id,
            or_(
                AccessLog.action.ilike("%login%"),
                AccessLog.action.ilike("%logout%"),
                AccessLog.action.ilike("%auth%"),
                AccessLog.resource.ilike("%auth%"),
            ),
        )
        .order_by(AccessLog.logged_at.desc())
        .limit(limit)
    ).all()
    return _serialize(rows)
