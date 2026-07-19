from sqlalchemy import ForeignKey, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    permissions: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    tenant = relationship("Tenant", back_populates="roles")
    users = relationship("User", secondary="user_roles", back_populates="roles")
    permission_links = relationship(
        "RolePermission", back_populates="role", cascade="all, delete-orphan"
    )
