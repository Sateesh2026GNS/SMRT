from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company_settings import CompanySettings
from app.models.tenant import Tenant
from app.schemas.company_settings import CompanySettingsUpdate


def get_or_create_settings(db: Session, tenant_id: int) -> CompanySettings:
    settings = db.scalars(
        select(CompanySettings).where(CompanySettings.tenant_id == tenant_id)
    ).first()
    if settings:
        return settings

    # Seed defaults from the tenant name on first access.
    tenant = db.get(Tenant, tenant_id)
    settings = CompanySettings(
        tenant_id=tenant_id,
        company_name=tenant.name if tenant else None,
        invoice_prefix="INV-",
        po_prefix="PO-",
        so_prefix="SO-",
        invoice_next_number=1,
    )
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def update_settings(
    db: Session, tenant_id: int, payload: CompanySettingsUpdate
) -> CompanySettings:
    settings = get_or_create_settings(db, tenant_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
