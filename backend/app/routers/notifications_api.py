"""ERP Notification Management API."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth_deps import get_current_user
from app.api.deps import get_db
from app.models.user import User
from app.services.notification_management_service import NotificationManagementService
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def _svc(db: Session, user: User) -> NotificationManagementService:
    return NotificationManagementService(db, user)


@router.get("")
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _svc(db, user).list_notifications(page, page_size)
    return success_response("Notifications retrieved", data)


@router.get("/unread-count")
async def unread_count(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return success_response("Unread count retrieved", _svc(db, user).unread_count())


@router.put("/read-all")
async def mark_all_read(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _svc(db, user).mark_all_read()
    return success_response("All notifications marked as read", data)


@router.delete("/clear")
async def clear_notifications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _svc(db, user).clear_all()
    return success_response("All notifications cleared", data)


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _svc(db, user).mark_read(notification_id)
    return success_response("Notification marked as read", data)


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _svc(db, user).delete_notification(notification_id)
    return success_response("Notification deleted", data)
