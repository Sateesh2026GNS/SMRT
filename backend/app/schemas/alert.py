from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AlertBase(BaseModel):
    tenant_id: int
    alert_type: str
    title: str
    message: str | None = None
    severity: str = "medium"
    status: str = "active"
    triggered_at: datetime
    reference_type: str | None = None
    reference_id: int | None = None
    module: str | None = None
    link: str | None = None
    target_role: str | None = None
    metadata_json: str | None = None
    created_by: str | None = None
    is_read: bool = False


class AlertCreate(BaseModel):
    tenant_id: int
    alert_type: str
    title: str
    message: str | None = None
    severity: str = "medium"
    status: str = "active"
    triggered_at: datetime | None = None
    reference_type: str | None = None
    reference_id: int | None = None
    module: str | None = None
    link: str | None = None
    target_role: str | None = None
    metadata_json: str | None = None
    created_by: str | None = None
    is_read: bool = False


class AlertRead(AlertBase):
    id: int
    acknowledged_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class AlertListResponse(BaseModel):
    items: list[AlertRead]
    total: int
    page: int = 1
    page_size: int = 50
    unread_count: int = 0
