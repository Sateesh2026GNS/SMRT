from pydantic import BaseModel


class InspectionSummaryRead(BaseModel):
    todays_inspections: int = 0
    pending_inspection: int = 0
    passed: int = 0
    failed: int = 0
    rejected_lots: int = 0
    avg_inspection_time: float = 0


class IncomingInspectionRead(BaseModel):
    id: int
    inspection_number: str
    po_reference: str | None = None
    vendor_name: str | None = None
    material_name: str | None = None
    batch_code: str | None = None
    quantity: float = 0
    inspector: str | None = None
    result: str = "pending"
    status: str = "pending"
    inspection_date: str | None = None
    inspection_time_minutes: float | None = None
    attachment: str | None = None


class ProcessQCSummaryRead(BaseModel):
    production_running: int = 0
    qc_pending: int = 0
    passed: int = 0
    failed: int = 0
    rework: int = 0
    scrap: int = 0


class ProcessQCRead(BaseModel):
    id: int
    work_order_number: str | None = None
    machine_name: str | None = None
    shift: str | None = None
    operator_name: str | None = None
    inspection_time: str | None = None
    qc_status: str = "pending"
    remarks: str | None = None
    product_name: str | None = None
    batch_code: str | None = None


class FinalQCSummaryRead(BaseModel):
    pending_final: int = 0
    passed: int = 0
    failed: int = 0
    packed: int = 0
    ready_dispatch: int = 0


class FinalQCRead(BaseModel):
    id: int
    inspection_number: str
    customer_name: str | None = None
    sales_order_number: str | None = None
    product_name: str | None = None
    batch_code: str | None = None
    packing_status: str | None = None
    approval: str | None = None
    certificate_ref: str | None = None
    result: str = "pending"
    status: str = "pending"
    inspector: str | None = None
    inspection_date: str | None = None


class BatchReportSummaryRead(BaseModel):
    total_batches: int = 0
    passed: int = 0
    failed: int = 0
    yield_pct: float = 0
    scrap_pct: float = 0
    rework_pct: float = 0


class BatchReportRead(BaseModel):
    id: int
    batch_code: str | None = None
    product_name: str | None = None
    shift: str | None = None
    production_qty: int = 0
    pass_qty: int = 0
    reject_qty: int = 0
    yield_pct: float = 0
    inspector: str | None = None
    report_date: str | None = None


class DefectSummaryRead(BaseModel):
    total_defects: int = 0
    open: int = 0
    in_progress: int = 0
    resolved: int = 0
    critical: int = 0
    capa_pending: int = 0


class DefectEnrichedRead(BaseModel):
    id: int
    defect_code: str
    description: str
    product_name: str | None = None
    batch_code: str | None = None
    machine_name: str | None = None
    department: str | None = None
    root_cause: str | None = None
    corrective_action: str | None = None
    preventive_action: str | None = None
    assigned_to: str | None = None
    due_date: str | None = None
    attachment: str | None = None
    severity: str = "medium"
    status: str = "open"
    quantity_affected: int = 1
    reported_at: str | None = None


class QualityHubRead(BaseModel):
    total_inspections: int = 0
    passed: int = 0
    failed: int = 0
    rejected: int = 0
    yield_pct: float = 0
    defect_rate: float = 0
    pass_vs_fail: list[dict] = []
    defect_trend: list[dict] = []
    monthly_yield: list[dict] = []
    supplier_quality: list[dict] = []
    machine_defects: list[dict] = []
    pareto_defects: list[dict] = []
    root_cause_analysis: list[dict] = []
    defect_by_product: list[dict] = []
    qc_performance: list[dict] = []
    recent_inspections: list[dict] = []
    alerts: list[dict] = []
