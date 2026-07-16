from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

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
