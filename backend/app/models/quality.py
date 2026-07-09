from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class QualityInspection(Base, TimestampMixin):
    __tablename__ = "quality_inspections"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    inspection_number: Mapped[str] = mapped_column(String(64), nullable=False)
    inspection_date: Mapped[date] = mapped_column(Date, nullable=False)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"))
    batch_id: Mapped[int | None] = mapped_column(ForeignKey("batches.id"))
    result: Mapped[str] = mapped_column(String(32), nullable=False)  # pass, fail, conditional
    inspector: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)
    inspection_type: Mapped[str] = mapped_column(String(32), default="incoming", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    po_reference: Mapped[str | None] = mapped_column(String(64))
    vendor_name: Mapped[str | None] = mapped_column(String(255))
    material_name: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[float | None] = mapped_column(Numeric(12, 2))
    batch_code: Mapped[str | None] = mapped_column(String(64))
    work_order_number: Mapped[str | None] = mapped_column(String(64))
    machine_name: Mapped[str | None] = mapped_column(String(255))
    shift: Mapped[str | None] = mapped_column(String(64))
    operator_name: Mapped[str | None] = mapped_column(String(255))
    customer_name: Mapped[str | None] = mapped_column(String(255))
    sales_order_number: Mapped[str | None] = mapped_column(String(64))
    product_name: Mapped[str | None] = mapped_column(String(255))
    packing_status: Mapped[str | None] = mapped_column(String(32))
    approval: Mapped[str | None] = mapped_column(String(32))
    certificate_ref: Mapped[str | None] = mapped_column(String(128))
    inspection_time_minutes: Mapped[float | None] = mapped_column(Numeric(8, 2))
    attachment: Mapped[str | None] = mapped_column(String(512))


class Defect(Base, TimestampMixin):
    __tablename__ = "defects"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    defect_code: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"))
    batch_id: Mapped[int | None] = mapped_column(ForeignKey("batches.id"))
    quantity_affected: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open", nullable=False)
    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    product_name: Mapped[str | None] = mapped_column(String(255))
    batch_code: Mapped[str | None] = mapped_column(String(64))
    machine_name: Mapped[str | None] = mapped_column(String(255))
    department: Mapped[str | None] = mapped_column(String(128))
    root_cause: Mapped[str | None] = mapped_column(Text)
    corrective_action: Mapped[str | None] = mapped_column(Text)
    preventive_action: Mapped[str | None] = mapped_column(Text)
    assigned_to: Mapped[str | None] = mapped_column(String(255))
    due_date: Mapped[date | None] = mapped_column(Date)
    attachment: Mapped[str | None] = mapped_column(String(512))


class BatchQualityReport(Base, TimestampMixin):
    __tablename__ = "batch_quality_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"), nullable=False)
    report_date: Mapped[date] = mapped_column(Date, nullable=False)
    pass_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fail_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    product_name: Mapped[str | None] = mapped_column(String(255))
    batch_code: Mapped[str | None] = mapped_column(String(64))
    shift: Mapped[str | None] = mapped_column(String(64))
    production_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reject_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rework_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    inspector: Mapped[str | None] = mapped_column(String(255))


class ComplianceLog(Base, TimestampMixin):
    __tablename__ = "compliance_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    log_type: Mapped[str] = mapped_column(String(64), nullable=False)
    reference: Mapped[str | None] = mapped_column(String(128))
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="completed", nullable=False)
