from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LoginHistoryRead(BaseModel):
    id: int
    user_id: int | None = None
    company_id: int | None = None
    full_name: str | None = None
    company_name: str | None = None
    email: str
    role: str | None = None
    ip_address: str | None = None
    browser: str | None = None
    operating_system: str | None = None
    device_type: str | None = None
    login_status: str
    login_at: datetime
    logout_at: datetime | None = None
    created_at: datetime | None = None
    login_date: str | None = None
    login_time: str | None = None
    logout_time: str | None = None

    model_config = ConfigDict(from_attributes=True)
