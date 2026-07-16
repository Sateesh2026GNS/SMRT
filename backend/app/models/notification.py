from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class UserNotificationState(Base, TimestampMixin):
    """Per-user read/cleared state for in-app bell notifications."""

    __tablename__ = "user_notification_states"
    __table_args__ = (
        UniqueConstraint("user_id", "notification_key", name="uq_user_notification_key"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    notification_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    # read = seen in panel; cleared = dismissed from list
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="read")
