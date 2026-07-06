from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Income(Base, TimestampMixin):
    """Revenue from non-invoice sources (e.g. Website Sales, Consulting)."""
    __tablename__ = "income"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "Website Sales"
    source: Mapped[str | None] = mapped_column(String(255))  # e.g. customer/vendor name
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    income_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)


class Expense(Base, TimestampMixin):
    """Cost/expense tracking for P&L."""
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "Store Rental"
    vendor: Mapped[str | None] = mapped_column(String(255))  # e.g. "Supplier #1"
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    expense_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
