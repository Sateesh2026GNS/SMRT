from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class MaintenanceRecord(Base, TimestampMixin):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"), nullable=False)
    maintenance_date: Mapped[date] = mapped_column(Date, nullable=False)
    maintenance_type: Mapped[str] = mapped_column(String(64), nullable=False)  # corrective, preventive
    description: Mapped[str | None] = mapped_column(Text)
    performed_by: Mapped[str | None] = mapped_column(String(255))
    cost: Mapped[float | None] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(String(32), default="completed", nullable=False)


class PreventiveMaintenance(Base, TimestampMixin):
    __tablename__ = "preventive_maintenance"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"), nullable=False)
    schedule_date: Mapped[date] = mapped_column(Date, nullable=False)
    task_description: Mapped[str] = mapped_column(String(255), nullable=False)
    frequency: Mapped[str] = mapped_column(String(64), default="monthly", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="scheduled", nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class BreakdownReport(Base, TimestampMixin):
    __tablename__ = "breakdown_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"), nullable=False)
    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    downtime_minutes: Mapped[int | None] = mapped_column(Integer)
    resolution: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="reported", nullable=False)


class MaintenanceSchedule(Base, TimestampMixin):
    __tablename__ = "maintenance_schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"), nullable=False)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    next_due_date: Mapped[date] = mapped_column(Date, nullable=False)
    frequency_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
