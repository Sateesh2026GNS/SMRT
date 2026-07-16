from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class QualityInspectionBase(BaseModel):
    tenant_id: int
    inspection_number: str
    inspection_date: date
    product_id: int | None = None
    batch_id: int | None = None
    result: str
    inspector: str | None = None
    notes: str | None = None


class QualityInspectionCreate(QualityInspectionBase):
    pass


class QualityInspectionRead(QualityInspectionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class DefectBase(BaseModel):
    tenant_id: int
    defect_code: str
    description: str
    product_id: int | None = None
    batch_id: int | None = None
    quantity_affected: int = 1
    severity: str = "medium"
    status: str = "open"
    reported_at: datetime


class DefectCreate(DefectBase):
    pass


class DefectRead(DefectBase):
    id: int
    resolved_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class BatchQualityReportBase(BaseModel):
    tenant_id: int
    batch_id: int
    report_date: date
    pass_count: int = 0
    fail_count: int = 0
    summary: str | None = None


class BatchQualityReportCreate(BatchQualityReportBase):
    pass


class BatchQualityReportRead(BatchQualityReportBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ComplianceLogBase(BaseModel):
    tenant_id: int
    log_type: str
    reference: str | None = None
    logged_at: datetime
    description: str | None = None
    status: str = "completed"


class ComplianceLogCreate(ComplianceLogBase):
    pass


class ComplianceLogRead(ComplianceLogBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
