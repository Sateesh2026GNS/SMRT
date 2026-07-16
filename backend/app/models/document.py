from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    doc_type: Mapped[str] = mapped_column(String(64), nullable=False)
    # purchase, production, quality, reports
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(512))
    file_name: Mapped[str | None] = mapped_column(String(255))
    reference_type: Mapped[str | None] = mapped_column(String(64))
    reference_id: Mapped[int | None] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    uploaded_by: Mapped[str | None] = mapped_column(String(255))
