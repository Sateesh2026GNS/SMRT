"""Platform-level models: Super Admin, OTP challenges, OTP audit logs, licenses."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class PlatformSuperAdmin(Base, TimestampMixin):
    """Single GNS Super Admin account for the platform admin portal."""

    __tablename__ = "platform_super_admins"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    otp_challenges = relationship(
        "OtpChallenge", back_populates="super_admin", cascade="all, delete-orphan"
    )


class OtpChallenge(Base, TimestampMixin):
    """OTP verification challenge for Super Admin login (hashed code only)."""

    __tablename__ = "otp_challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    super_admin_id: Mapped[int] = mapped_column(
        ForeignKey("platform_super_admins.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    challenge_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    code_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    invalidated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    purpose: Mapped[str] = mapped_column(String(32), default="super_admin_login", nullable=False)
    last_sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    super_admin = relationship("PlatformSuperAdmin", back_populates="otp_challenges")


class OtpAuditLog(Base, TimestampMixin):
    """Audit trail for OTP generation and verification attempts."""

    __tablename__ = "otp_audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    super_admin_id: Mapped[int | None] = mapped_column(
        ForeignKey("platform_super_admins.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    challenge_token: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    event: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    success: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    detail: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    meta: Mapped[str | None] = mapped_column(Text, nullable=True)


class CompanyLicense(Base, TimestampMixin):
    """Subscription license issued to a tenant company."""

    __tablename__ = "company_licenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    plan: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    max_users: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
