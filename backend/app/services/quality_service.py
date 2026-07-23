from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.quality import BatchQualityReport, ComplianceLog, Defect, QualityInspection
from app.schemas.quality import (
    BatchQualityReportCreate,
    ComplianceLogCreate,
    DefectCreate,
    QualityInspectionCreate,
)


def create_quality_inspection(db: Session, payload: QualityInspectionCreate) -> QualityInspection:
    qi = QualityInspection(**payload.model_dump())
    db.add(qi)
    db.commit()
    db.refresh(qi)
    try:
        from app.services.alert_event_service import emit_alert

        result = (getattr(qi, "result", None) or getattr(qi, "status", "") or "").lower()
        if result in ("fail", "failed", "rejected"):
            atype, sev = "qc_failed", "high"
        elif result in ("rework", "rework_required"):
            atype, sev = "rework_required", "medium"
        else:
            atype, sev = "qc_passed", "low"
        emit_alert(
            db,
            tenant_id=qi.tenant_id,
            alert_type=atype,
            title=f"Quality inspection: {atype.replace('_', ' ')}",
            message=qi.notes or f"Inspection #{qi.id} — {result or 'recorded'}",
            severity=sev,
            link="/quality/inspection",
            reference_type="quality_inspection",
            reference_id=qi.id,
            created_by="Quality",
        )
    except Exception:
        pass
    return qi


def list_quality_inspections(db: Session, tenant_id: int) -> list[QualityInspection]:
    stmt = select(QualityInspection).where(QualityInspection.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_defect(db: Session, payload: DefectCreate) -> Defect:
    d = Defect(**payload.model_dump())
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


def list_defects(db: Session, tenant_id: int) -> list[Defect]:
    stmt = select(Defect).where(Defect.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def update_defect_status(
    db: Session, tenant_id: int, defect_id: int, status: str
) -> Defect | None:
    d = db.scalars(
        select(Defect).where(Defect.id == defect_id, Defect.tenant_id == tenant_id)
    ).first()
    if not d:
        return None
    d.status = status
    db.commit()
    db.refresh(d)
    return d


def create_batch_quality_report(db: Session, payload: BatchQualityReportCreate) -> BatchQualityReport:
    bqr = BatchQualityReport(**payload.model_dump())
    db.add(bqr)
    db.commit()
    db.refresh(bqr)
    return bqr


def list_batch_quality_reports(db: Session, tenant_id: int) -> list[BatchQualityReport]:
    stmt = select(BatchQualityReport).where(BatchQualityReport.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_compliance_log(db: Session, payload: ComplianceLogCreate) -> ComplianceLog:
    cl = ComplianceLog(**payload.model_dump())
    db.add(cl)
    db.commit()
    db.refresh(cl)
    return cl


def list_compliance_logs(db: Session, tenant_id: int) -> list[ComplianceLog]:
    stmt = select(ComplianceLog).where(ComplianceLog.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())
