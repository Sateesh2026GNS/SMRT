"""Persistent in-app notifications for ERP users."""

from sqlalchemy import Boolean, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin

NOTIFICATION_TYPES = frozenset({
    "information",
    "success",
    "warning",
    "error",
    "production",
    "inventory",
    "quality",
    "maintenance",
    "sales",
    "hr",
    "finance",
    "system",
})

NOTIFICATION_PRIORITIES = frozenset({"low", "medium", "high", "critical"})


class ErpNotification(Base, TimestampMixin):
    __tablename__ = "erp_notifications"
    __table_args__ = (
        Index("ix_erp_notifications_user_id", "user_id"),
        Index("ix_erp_notifications_is_read", "is_read"),
        Index("ix_erp_notifications_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False, default="information")
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    module: Mapped[str] = mapped_column(String(64), nullable=False, default="system")
    action_url: Mapped[str | None] = mapped_column(String(512))
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_by: Mapped[str | None] = mapped_column(String(255))
    created_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
