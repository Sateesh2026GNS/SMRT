"""Pydantic schemas for ERP notification management."""

from datetime import datetime

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    type: str = "information"
    priority: str = "medium"
    module: str = "system"
    action_url: str | None = None
    created_by: str | None = None
    user_id: int | None = None


class NotificationRead(BaseModel):
    id: int
    title: str
    message: str
    type: str
    priority: str
    module: str
    action_url: str | None = None
    is_read: bool
    read: bool  # alias for frontend compatibility
    created_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NotificationListData(BaseModel):
    items: list[NotificationRead]
    total: int
    page: int
    page_size: int
    has_more: bool
    unread_count: int


class UnreadCountData(BaseModel):
    unread_count: int
