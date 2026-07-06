from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.maintenance import (
    BreakdownReport,
    MaintenanceRecord,
    MaintenanceSchedule,
    PreventiveMaintenance,
)
from app.schemas.maintenance import (
    BreakdownReportCreate,
    MaintenanceRecordCreate,
    MaintenanceScheduleCreate,
    PreventiveMaintenanceCreate,
)


def create_maintenance_record(db: Session, payload: MaintenanceRecordCreate) -> MaintenanceRecord:
    mr = MaintenanceRecord(**payload.model_dump())
    db.add(mr)
    db.commit()
    db.refresh(mr)
    return mr


def list_maintenance_records(db: Session, tenant_id: int) -> list[MaintenanceRecord]:
    stmt = select(MaintenanceRecord).where(MaintenanceRecord.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_preventive_maintenance(db: Session, payload: PreventiveMaintenanceCreate) -> PreventiveMaintenance:
    pm = PreventiveMaintenance(**payload.model_dump())
    db.add(pm)
    db.commit()
    db.refresh(pm)
    return pm


def list_preventive_maintenance(db: Session, tenant_id: int) -> list[PreventiveMaintenance]:
    stmt = select(PreventiveMaintenance).where(PreventiveMaintenance.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_breakdown_report(db: Session, payload: BreakdownReportCreate) -> BreakdownReport:
    br = BreakdownReport(**payload.model_dump())
    db.add(br)
    db.commit()
    db.refresh(br)
    return br


def list_breakdown_reports(db: Session, tenant_id: int) -> list[BreakdownReport]:
    stmt = select(BreakdownReport).where(BreakdownReport.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def update_breakdown_status(
    db: Session, tenant_id: int, breakdown_id: int, status: str
) -> BreakdownReport | None:
    br = db.scalars(
        select(BreakdownReport).where(
            BreakdownReport.id == breakdown_id,
            BreakdownReport.tenant_id == tenant_id,
        )
    ).first()
    if not br:
        return None
    br.status = status
    db.commit()
    db.refresh(br)
    return br


def create_maintenance_schedule(db: Session, payload: MaintenanceScheduleCreate) -> MaintenanceSchedule:
    ms = MaintenanceSchedule(**payload.model_dump())
    db.add(ms)
    db.commit()
    db.refresh(ms)
    return ms


def list_maintenance_schedules(db: Session, tenant_id: int) -> list[MaintenanceSchedule]:
    stmt = select(MaintenanceSchedule).where(MaintenanceSchedule.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())
