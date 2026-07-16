from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class AiConversation(Base, TimestampMixin):
    __tablename__ = "ai_conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(String(255))

    messages = relationship("AiMessage", back_populates="conversation", cascade="all, delete-orphan")


class AiMessage(Base, TimestampMixin):
    __tablename__ = "ai_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("ai_conversations.id"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False)  # user | assistant | tool
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tool_name: Mapped[str | None] = mapped_column(String(64))
    navigation_path: Mapped[str | None] = mapped_column(String(255))

    conversation = relationship("AiConversation", back_populates="messages")
