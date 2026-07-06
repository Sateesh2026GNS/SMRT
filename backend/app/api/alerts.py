from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.auth_deps import get_current_user
from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.alert import AlertCreate, AlertRead
from app.services.alert_service import (
    acknowledge_alert,
    create_alert,
    list_alerts,
    sync_low_stock_alerts,
)

router = APIRouter(prefix="/alerts", tags=["alerts"])

MODULE = "alerts"


@router.post("", response_model=AlertRead)
def create_alert_endpoint(
    payload: AlertCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> AlertRead:
    payload.tenant_id = user.tenant_id
    return create_alert(db, payload)


@router.get("", response_model=list[AlertRead])
def list_alerts_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    alert_type: str | None = Query(None),
    status: str | None = Query(None),
    sync_low_stock: bool = Query(False),
    db: Session = Depends(get_db),
) -> list[AlertRead]:
    if sync_low_stock or alert_type == "low_stock":
        sync_low_stock_alerts(db, tenant_id)
    return list_alerts(db, tenant_id, alert_type, status)


@router.get("/notifications")
def notifications_endpoint(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """In-app bell notifications — available to all authenticated users; content is filtered by role."""
    from app.services.notification_service import get_user_notifications

    return get_user_notifications(db, user)


@router.post("/sync-low-stock", response_model=list[AlertRead])
def sync_low_stock_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> list[AlertRead]:
    return sync_low_stock_alerts(db, tenant_id)


@router.post("/{alert_id}/acknowledge")
def acknowledge_alert_endpoint(
    alert_id: int,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    alert = acknowledge_alert(db, alert_id, tenant_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return {"acknowledged": True, "id": alert.id}
