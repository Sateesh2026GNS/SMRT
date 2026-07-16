from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
<<<<<<< HEAD

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
=======
from sqlalchemy import select

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.models.company_settings import CompanySettings
from app.schemas.company_settings import CompanySettingsRead, CompanySettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])

MODULE = "settings"


@router.get("/company", response_model=CompanySettingsRead)
def get_company_settings_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    settings = db.scalar(
        select(CompanySettings).where(CompanySettings.tenant_id == tenant_id)
    )
    if not settings:
        # Create default company settings for the tenant
        settings = CompanySettings(
            tenant_id=tenant_id,
            company_name="GNS",
            legal_name="GNS India Private Limited",
            invoice_prefix="INV",
            invoice_next_number=1,
            po_prefix="PO",
            so_prefix="SO",
            prices_include_tax=False,
            default_gst_pct=18.0,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/company", response_model=CompanySettingsRead)
def update_company_settings_endpoint(
    payload: CompanySettingsUpdate,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    settings = db.scalar(
        select(CompanySettings).where(CompanySettings.tenant_id == tenant_id)
    )
    if not settings:
        settings = CompanySettings(tenant_id=tenant_id)
        db.add(settings)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
>>>>>>> 42502626 (first commit)
