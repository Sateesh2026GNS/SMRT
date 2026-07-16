from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.maintenance import (
    BreakdownReportCreate,
    BreakdownReportRead,
    MaintenanceRecordCreate,
    MaintenanceRecordRead,
    MaintenanceScheduleCreate,
    MaintenanceScheduleRead,
    PreventiveMaintenanceCreate,
    PreventiveMaintenanceRead,
)
from app.services.maintenance_service import (
    create_breakdown_report,
    create_maintenance_record,
    create_maintenance_schedule,
    create_preventive_maintenance,
    list_breakdown_reports,
    list_maintenance_records,
    list_maintenance_schedules,
    list_preventive_maintenance,
    update_breakdown_status,
)
from app.services.maintenance_extended_service import (
    get_breakdown_summary,
    get_maintenance_hub,
    get_preventive_summary,
    list_breakdowns_enriched,
    list_machine_history,
    list_preventive_enriched,
)

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

MODULE = "maintenance"


@router.post("/records", response_model=MaintenanceRecordRead)
def create_maintenance_record_endpoint(
    payload: MaintenanceRecordCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> MaintenanceRecordRead:
    payload.tenant_id = user.tenant_id
    return create_maintenance_record(db, payload)


@router.get("/records", response_model=list[MaintenanceRecordRead])
def list_maintenance_records_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[MaintenanceRecordRead]:
    return list_maintenance_records(db, tenant_id)


@router.post("/preventive", response_model=PreventiveMaintenanceRead)
def create_preventive_endpoint(
    payload: PreventiveMaintenanceCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> PreventiveMaintenanceRead:
    payload.tenant_id = user.tenant_id
    return create_preventive_maintenance(db, payload)


@router.get("/preventive", response_model=list[PreventiveMaintenanceRead])
def list_preventive_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[PreventiveMaintenanceRead]:
    return list_preventive_maintenance(db, tenant_id)


@router.post("/breakdowns", response_model=BreakdownReportRead)
def create_breakdown_endpoint(
    payload: BreakdownReportCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> BreakdownReportRead:
    payload.tenant_id = user.tenant_id
    return create_breakdown_report(db, payload)


@router.get("/breakdowns", response_model=list[BreakdownReportRead])
def list_breakdowns_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[BreakdownReportRead]:
    return list_breakdown_reports(db, tenant_id)


@router.patch("/breakdowns/{breakdown_id}/status", response_model=BreakdownReportRead)
def update_breakdown_status_endpoint(
    breakdown_id: int,
    status: str = Query(..., description="e.g. reported, in_progress, resolved"),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> BreakdownReportRead:
    br = update_breakdown_status(db, tenant_id, breakdown_id, status)
    if not br:
        raise HTTPException(404, "Breakdown report not found")
    return br


@router.post("/schedule", response_model=MaintenanceScheduleRead)
def create_schedule_endpoint(
    payload: MaintenanceScheduleCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> MaintenanceScheduleRead:
    payload.tenant_id = user.tenant_id
    return create_maintenance_schedule(db, payload)


@router.get("/schedule", response_model=list[MaintenanceScheduleRead])
def list_schedule_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[MaintenanceScheduleRead]:
    return list_maintenance_schedules(db, tenant_id)


@router.get("/hub")
def maintenance_hub_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_maintenance_hub(db, tenant_id)


@router.get("/preventive/summary")
def preventive_summary_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_preventive_summary(db, tenant_id)


@router.get("/preventive/enriched")
def preventive_enriched_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_preventive_enriched(db, tenant_id)


@router.get("/breakdowns/summary")
def breakdown_summary_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_breakdown_summary(db, tenant_id)


@router.get("/breakdowns/enriched")
def breakdowns_enriched_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_breakdowns_enriched(db, tenant_id)


@router.get("/history")
def machine_history_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_machine_history(db, tenant_id)
