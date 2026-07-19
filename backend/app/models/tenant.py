from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Tenant(Base, TimestampMixin):
    """Company / organization (multi-tenant company record)."""

    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_code: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(128), nullable=True)
    state: Mapped[str | None] = mapped_column(String(128), nullable=True)
    country: Mapped[str | None] = mapped_column(String(128), nullable=True)
    pin_code: Mapped[str | None] = mapped_column(String(16), nullable=True)
    gst_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    subscription: Mapped[str | None] = mapped_column(String(50), default="trial", nullable=True)
    trial_status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    trial_days: Mapped[int | None] = mapped_column(Integer, default=5, nullable=True)
    trial_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    license_status: Mapped[str | None] = mapped_column(String(32), default="active", nullable=True)

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="tenant", cascade="all, delete-orphan")
    products = relationship(
        "Product", back_populates="tenant", cascade="all, delete-orphan"
    )
    production_orders = relationship(
        "ProductionOrder", back_populates="tenant", cascade="all, delete-orphan"
    )
    machines = relationship("Machine", cascade="all, delete-orphan")
    daily_production_reports = relationship(
        "DailyProductionReport", cascade="all, delete-orphan"
    )
