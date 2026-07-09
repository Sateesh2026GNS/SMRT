from datetime import datetime

from pydantic import BaseModel


class BatchSummaryRead(BaseModel):
    total_batches: int = 0
    running: int = 0
    completed: int = 0
    hold: int = 0
    rejected: int = 0
    expired: int = 0


class BatchListRead(BaseModel):
    id: int
    batch_code: str
    product_name: str
    work_order_number: str | None = None
    production_date: str | None = None
    quantity: float
    good_qty: float = 0
    scrap_qty: float = 0
    status: str


class BatchTraceStepRead(BaseModel):
    step: str
    status: str
    detail: str | None = None
    timestamp: str | None = None


class BatchDetailRead(BaseModel):
    id: int
    batch_code: str
    product_name: str
    customer_name: str | None = None
    production_order_number: str | None = None
    work_order_number: str | None = None
    machine_name: str | None = None
    operator_name: str | None = None
    shift: str | None = None
    material_lot: str | None = None
    qc_status: str | None = None
    dispatch_status: str | None = None
    invoice_number: str | None = None
    quantity: float
    good_qty: float = 0
    scrap_qty: float = 0
    status: str
    produced_at: datetime | None = None
    traceability: list[BatchTraceStepRead] = []
