from pydantic import BaseModel, Field


class ScheduleDashboardRead(BaseModel):
    today: str
    production_target: int = 0
    completed: int = 0
    pending: int = 0
    overall_progress_pct: float = 0
    machine_utilization_pct: float = 0
    operators_present: int = 0
    delayed_orders: int = 0
    material_shortage: int = 0


class ScheduleTimelineRowRead(BaseModel):
    machine_id: int
    machine_name: str
    machine_code: str
    status: str
    job_label: str
    work_order_id: int | None = None
    work_order_number: str | None = None
    start_slot: int = 0
    span_slots: int = 1


class ShiftScheduleItemRead(BaseModel):
    shift_name: str
    machine_name: str
    operator_name: str
    product_name: str
    quantity: float
    status: str = "planned"


class ProductionQueueItemRead(BaseModel):
    position: int
    work_order_id: int | None = None
    work_order_number: str | None = None
    product_name: str
    quantity: float
    priority: str = "medium"
    machine_id: int | None = None


class MaterialAvailabilityRead(BaseModel):
    product_name: str
    material_status: str
    available: bool


class ScheduleConflictRead(BaseModel):
    conflict_type: str
    message: str
    severity: str = "warning"


class RescheduleRequest(BaseModel):
    work_order_id: int
    machine_id: int
    start_slot: int | None = None


class BottomKpiRead(BaseModel):
    todays_production: int = 0
    pending_orders: int = 0
    machine_efficiency_pct: float = 0
    shift_efficiency_pct: float = 0
    downtime_minutes: int = 0
    power_kwh: float = 0
    oee_pct: float = 0
    quality_rate_pct: float = 0
