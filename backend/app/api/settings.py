from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.company_settings import CompanySettingsRead, CompanySettingsUpdate
from app.services import company_settings_service

router = APIRouter(prefix="/settings", tags=["Settings"])

MODULE = "admin"


@router.get("/company", response_model=CompanySettingsRead)
def get_company_settings(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> CompanySettingsRead:
    return company_settings_service.get_or_create_settings(db, tenant_id)


@router.put("/company", response_model=CompanySettingsRead)
def update_company_settings(
    payload: CompanySettingsUpdate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> CompanySettingsRead:
    return company_settings_service.update_settings(db, user.tenant_id, payload)
