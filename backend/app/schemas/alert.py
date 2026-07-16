from datetime import datetime

from pydantic import BaseModel, ConfigDict


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


class AlertCreate(AlertBase):
    pass


class AlertRead(AlertBase):
    id: int
    acknowledged_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
