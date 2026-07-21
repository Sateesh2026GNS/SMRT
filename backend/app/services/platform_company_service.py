"""Platform company provisioning and management (Super Admin only)."""

import re
import secrets
import string
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.permissions import ADMIN_ROLE
from app.core.seed_roles import seed_roles_for_tenant
from app.models.company_settings import CompanySettings
from app.models.platform import CompanyLicense
from app.models.role import Role
from app.models.tenant import Tenant
from app.models.user import User, user_roles
from app.schemas.platform import CreateCompanyRequest, UpdateCompanyRequest, UpdateLicenseRequest
from app.services.auth_service import hash_password
from app.services.email_service import send_company_welcome_email


def _slugify(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
    return s[:80] if s else "company"


def _company_code(tenant_id: int) -> str:
    return f"GNS-{tenant_id:05d}"


def _generate_temp_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _get_tenant_admin(db: Session, tenant_id: int) -> User | None:
    users = db.scalars(
        select(User)
        .where(User.tenant_id == tenant_id)
        .options(selectinload(User.roles))
    ).all()
    for u in users:
        if any(r.name == ADMIN_ROLE for r in u.roles):
            return u
    return users[0] if users else None


def serialize_company(db: Session, tenant: Tenant) -> dict:
    admin = _get_tenant_admin(db, tenant.id)
    user_count = db.scalar(
        select(func.count(User.id)).where(User.tenant_id == tenant.id)
    ) or 0
    license_row = db.scalars(
        select(CompanyLicense).where(CompanyLicense.tenant_id == tenant.id)
    ).first()

    return {
        "id": tenant.id,
        "company_code": tenant.company_code or _company_code(tenant.id),
        "company_name": tenant.name,
        "company_email": tenant.email,
        "mobile_number": tenant.phone,
        "gst_number": tenant.gst_number,
        "address": tenant.address,
        "city": tenant.city,
        "state": tenant.state,
        "country": tenant.country,
        "pin_code": tenant.pin_code,
        "status": tenant.status or "active",
        "subscription_plan": license_row.plan if license_row else tenant.subscription,
        "trial_days": tenant.trial_days,
        "trial_expires_at": tenant.trial_expires_at,
        "license_status": tenant.license_status or (license_row.status if license_row else "active"),
        "admin_name": admin.full_name if admin else None,
        "admin_email": admin.email if admin else None,
        "user_count": user_count,
        "created_at": tenant.created_at,
    }


class PlatformCompanyService:
    def __init__(self, db: Session):
        self.db = db

    def list_companies(self) -> list[dict]:
        tenants = self.db.scalars(select(Tenant).order_by(Tenant.id)).all()
        return [serialize_company(self.db, t) for t in tenants]

    def get_company(self, tenant_id: int) -> dict:
        tenant = self._get_tenant_or_404(tenant_id)
        return serialize_company(self.db, tenant)

    def create_company(self, payload: CreateCompanyRequest) -> dict:
        from app.core.company_email import (
            MSG_PUBLIC_EMAIL,
            email_domain,
            is_public_email_domain,
        )

        for email in (payload.company_email, payload.admin_email):
            if is_public_email_domain(email_domain(email)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=MSG_PUBLIC_EMAIL,
                )

        existing_email = self.db.scalars(
            select(User).where(User.email == payload.admin_email)
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Admin email is already registered.",
            )

        base_name = payload.company_name.strip()[:255]
        slug_base = _slugify(payload.company_name)
        display_name = base_name
        slug = slug_base
        n = 0
        while True:
            name_taken = self.db.scalars(
                select(Tenant).where(Tenant.name == display_name)
            ).first()
            slug_taken = self.db.scalars(select(Tenant).where(Tenant.slug == slug)).first()
            if not name_taken and not slug_taken:
                break
            n += 1
            slug = f"{slug_base}-{n}"
            display_name = f"{base_name} ({n})"[:255]

        trial_expires = datetime.now(timezone.utc) + timedelta(days=payload.trial_days)
        temp_password = payload.password

        try:
            tenant = Tenant(
                name=display_name,
                slug=slug,
                email=payload.company_email.strip().lower(),
                phone=payload.mobile_number.strip(),
                address=payload.address.strip(),
                city=payload.city.strip(),
                state=payload.state.strip(),
                country=payload.country.strip(),
                pin_code=payload.pin_code.strip(),
                gst_number=(payload.gst_number or "").strip() or None,
                status="active",
                subscription=payload.subscription_plan.strip().lower(),
                trial_status=True,
                trial_days=payload.trial_days,
                trial_expires_at=trial_expires,
                license_status="active",
            )
            self.db.add(tenant)
            self.db.flush()

            tenant.company_code = _company_code(tenant.id)

            seed_roles_for_tenant(self.db, tenant.id)
            admin_role = self.db.scalars(
                select(Role).where(Role.tenant_id == tenant.id, Role.name == ADMIN_ROLE)
            ).first()
            if not admin_role:
                raise HTTPException(status_code=500, detail="Failed to provision Admin role.")

            admin_user = User(
                tenant_id=tenant.id,
                email=payload.admin_email.strip().lower(),
                full_name=payload.admin_name.strip(),
                phone=payload.mobile_number.strip(),
                hashed_password=hash_password(temp_password),
                is_active=True,
                email_verified=True,
            )
            self.db.add(admin_user)
            self.db.flush()
            self.db.execute(
                user_roles.insert().values(user_id=admin_user.id, role_id=admin_role.id)
            )

            license_row = CompanyLicense(
                tenant_id=tenant.id,
                plan=payload.subscription_plan.strip(),
                status="active",
                max_users=50,
                issued_at=datetime.now(timezone.utc),
                expires_at=trial_expires,
            )
            self.db.add(license_row)

            settings_row = CompanySettings(
                tenant_id=tenant.id,
                company_name=display_name,
                email=payload.company_email.strip().lower(),
                phone=payload.mobile_number.strip(),
                gstin=(payload.gst_number or "").strip() or None,
                address_line1=payload.address.strip(),
                city=payload.city.strip(),
                state=payload.state.strip(),
                pincode=payload.pin_code.strip(),
            )
            self.db.add(settings_row)

            self.db.commit()
            self.db.refresh(tenant)

            company_id = tenant.company_code
            send_company_welcome_email(
                to=payload.admin_email.strip().lower(),
                company_name=display_name,
                login_email=payload.admin_email.strip().lower(),
                temporary_password=temp_password,
                company_id=company_id,
            )

            return {
                "company": serialize_company(self.db, tenant),
                "company_id": company_id,
                "admin_email": payload.admin_email.strip().lower(),
                "temporary_password": temp_password,
                "message": "Company created. Login details sent to company admin email.",
            }
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Could not create company. Please try again.",
            )

    def update_company(self, tenant_id: int, payload: UpdateCompanyRequest) -> dict:
        tenant = self._get_tenant_or_404(tenant_id)
        if payload.company_name is not None:
            tenant.name = payload.company_name.strip()
        if payload.company_email is not None:
            tenant.email = payload.company_email.strip().lower()
        if payload.mobile_number is not None:
            tenant.phone = payload.mobile_number.strip()
        if payload.gst_number is not None:
            tenant.gst_number = payload.gst_number.strip() or None
        if payload.address is not None:
            tenant.address = payload.address.strip()
        if payload.city is not None:
            tenant.city = payload.city.strip()
        if payload.state is not None:
            tenant.state = payload.state.strip()
        if payload.country is not None:
            tenant.country = payload.country.strip()
        if payload.pin_code is not None:
            tenant.pin_code = payload.pin_code.strip()
        if payload.subscription_plan is not None:
            tenant.subscription = payload.subscription_plan.strip().lower()
        if payload.trial_days is not None:
            tenant.trial_days = payload.trial_days
            tenant.trial_expires_at = datetime.now(timezone.utc) + timedelta(
                days=payload.trial_days
            )
        if payload.status is not None:
            tenant.status = payload.status.strip().lower()
        self.db.commit()
        self.db.refresh(tenant)
        return serialize_company(self.db, tenant)

    def activate_company(self, tenant_id: int) -> dict:
        tenant = self._get_tenant_or_404(tenant_id)
        tenant.status = "active"
        tenant.trial_status = True
        tenant.license_status = "active"
        self.db.commit()
        return serialize_company(self.db, tenant)

    def suspend_company(self, tenant_id: int) -> dict:
        tenant = self._get_tenant_or_404(tenant_id)
        tenant.status = "suspended"
        tenant.trial_status = False
        tenant.license_status = "suspended"
        self.db.commit()
        return serialize_company(self.db, tenant)

    def delete_company(self, tenant_id: int) -> None:
        if tenant_id == 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the platform default tenant.",
            )
        tenant = self._get_tenant_or_404(tenant_id)
        self.db.delete(tenant)
        self.db.commit()

    def reset_company_admin_password(self, tenant_id: int, new_password: str) -> dict:
        tenant = self._get_tenant_or_404(tenant_id)
        admin = _get_tenant_admin(self.db, tenant_id)
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company admin account not found.",
            )
        admin.hashed_password = hash_password(new_password)
        self.db.commit()
        return {
            "message": "Company admin password reset successfully.",
            "admin_email": admin.email,
            "company_name": tenant.name,
        }

    def list_company_users(self, tenant_id: int) -> list[dict]:
        self._get_tenant_or_404(tenant_id)
        users = self.db.scalars(
            select(User)
            .where(User.tenant_id == tenant_id)
            .options(selectinload(User.roles))
            .order_by(User.full_name)
        ).all()
        return [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "phone": u.phone,
                "employee_id": getattr(u, "employee_id", None),
                "designation": getattr(u, "designation", None),
                "department": u.department,
                "role": u.roles[0].name if u.roles else None,
                "is_active": u.is_active,
                "last_login_at": u.last_login_at.isoformat() if getattr(u, "last_login_at", None) else None,
            }
            for u in users
        ]

    def get_subscription(self, tenant_id: int) -> dict:
        tenant = self._get_tenant_or_404(tenant_id)
        license_row = self.db.scalars(
            select(CompanyLicense).where(CompanyLicense.tenant_id == tenant_id)
        ).first()
        return {
            "company_id": tenant.company_code or _company_code(tenant.id),
            "company_name": tenant.name,
            "subscription_plan": license_row.plan if license_row else tenant.subscription,
            "status": tenant.status,
            "trial_status": tenant.trial_status,
            "trial_days": tenant.trial_days,
            "trial_expires_at": tenant.trial_expires_at,
            "license_status": tenant.license_status,
            "license": {
                "plan": license_row.plan if license_row else None,
                "status": license_row.status if license_row else None,
                "max_users": license_row.max_users if license_row else None,
                "issued_at": license_row.issued_at if license_row else None,
                "expires_at": license_row.expires_at if license_row else None,
            }
            if license_row
            else None,
        }

    def update_license(self, tenant_id: int, payload: UpdateLicenseRequest) -> dict:
        tenant = self._get_tenant_or_404(tenant_id)
        license_row = self.db.scalars(
            select(CompanyLicense).where(CompanyLicense.tenant_id == tenant_id)
        ).first()
        if not license_row:
            license_row = CompanyLicense(
                tenant_id=tenant_id,
                plan=payload.plan or tenant.subscription or "trial",
                status=payload.status or "active",
                max_users=payload.max_users or 50,
                issued_at=datetime.now(timezone.utc),
                expires_at=payload.expires_at,
            )
            self.db.add(license_row)
        else:
            if payload.plan is not None:
                license_row.plan = payload.plan
                tenant.subscription = payload.plan.lower()
            if payload.status is not None:
                license_row.status = payload.status
                tenant.license_status = payload.status
            if payload.max_users is not None:
                license_row.max_users = payload.max_users
            if payload.expires_at is not None:
                license_row.expires_at = payload.expires_at
                tenant.trial_expires_at = payload.expires_at
        self.db.commit()
        return self.get_subscription(tenant_id)

    def _get_tenant_or_404(self, tenant_id: int) -> Tenant:
        tenant = self.db.scalars(select(Tenant).where(Tenant.id == tenant_id)).first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found."
            )
        return tenant
