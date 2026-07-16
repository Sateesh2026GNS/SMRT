from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class MaintenanceRecordBase(BaseModel):
    tenant_id: int
    machine_id: int
    maintenance_date: date
    maintenance_type: str
    description: str | None = None
    performed_by: str | None = None
    cost: float | None = None
    status: str = "completed"


class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass


class MaintenanceRecordRead(MaintenanceRecordBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class PreventiveMaintenanceBase(BaseModel):
    tenant_id: int
    machine_id: int
    schedule_date: date
    task_description: str
    frequency: str = "monthly"
    status: str = "scheduled"


class PreventiveMaintenanceCreate(PreventiveMaintenanceBase):
    pass


class PreventiveMaintenanceRead(PreventiveMaintenanceBase):
    id: int
    completed_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class BreakdownReportBase(BaseModel):
    tenant_id: int
    machine_id: int
    reported_at: datetime
    description: str | None = None
    downtime_minutes: int | None = None
    resolution: str | None = None
    status: str = "reported"


class BreakdownReportCreate(BreakdownReportBase):
    pass


class BreakdownReportRead(BreakdownReportBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class MaintenanceScheduleBase(BaseModel):
    tenant_id: int
    machine_id: int
    task_name: str
    next_due_date: date
    frequency_days: int = 30
    is_active: bool = True


class MaintenanceScheduleCreate(MaintenanceScheduleBase):
    pass


class MaintenanceScheduleRead(MaintenanceScheduleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
