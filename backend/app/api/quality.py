from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.quality import (
    BatchQualityReportCreate,
    BatchQualityReportRead,
    ComplianceLogCreate,
    ComplianceLogRead,
    DefectCreate,
    DefectRead,
    QualityInspectionCreate,
    QualityInspectionRead,
)
from app.services.quality_service import (
    create_batch_quality_report,
    create_compliance_log,
    create_defect,
    create_quality_inspection,
    list_batch_quality_reports,
    list_compliance_logs,
    list_defects,
    list_quality_inspections,
    update_defect_status,
)

router = APIRouter(prefix="/quality", tags=["quality"])

MODULE = "quality"


@router.post("/inspection", response_model=QualityInspectionRead)
def create_inspection_endpoint(
    payload: QualityInspectionCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> QualityInspectionRead:
    payload.tenant_id = user.tenant_id
    return create_quality_inspection(db, payload)


@router.get("/inspection", response_model=list[QualityInspectionRead])
def list_inspections_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[QualityInspectionRead]:
    return list_quality_inspections(db, tenant_id)


@router.post("/defects", response_model=DefectRead)
def create_defect_endpoint(
    payload: DefectCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> DefectRead:
    payload.tenant_id = user.tenant_id
    return create_defect(db, payload)


@router.get("/defects", response_model=list[DefectRead])
def list_defects_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[DefectRead]:
    return list_defects(db, tenant_id)


@router.patch("/defects/{defect_id}/status", response_model=DefectRead)
def update_defect_status_endpoint(
    defect_id: int,
    status: str = Query(..., description="e.g. open, in_progress, resolved, closed"),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> DefectRead:
    d = update_defect_status(db, tenant_id, defect_id, status)
    if not d:
        raise HTTPException(404, "Defect not found")
    return d


@router.post("/batch-reports", response_model=BatchQualityReportRead)
def create_batch_report_endpoint(
    payload: BatchQualityReportCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> BatchQualityReportRead:
    payload.tenant_id = user.tenant_id
    return create_batch_quality_report(db, payload)


@router.get("/batch-reports", response_model=list[BatchQualityReportRead])
def list_batch_reports_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[BatchQualityReportRead]:
    return list_batch_quality_reports(db, tenant_id)


@router.post("/compliance", response_model=ComplianceLogRead)
def create_compliance_endpoint(
    payload: ComplianceLogCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> ComplianceLogRead:
    payload.tenant_id = user.tenant_id
    return create_compliance_log(db, payload)


@router.get("/compliance", response_model=list[ComplianceLogRead])
def list_compliance_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[ComplianceLogRead]:
    return list_compliance_logs(db, tenant_id)
