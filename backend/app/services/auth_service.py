import re
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.core.seed_roles import seed_roles_for_tenant
from app.models.role import Role
from app.models.tenant import Tenant
from app.models.user import User, user_roles

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_settings = get_settings()
SECRET_KEY = _settings.jwt_secret_key
ALGORITHM = _settings.jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = _settings.access_token_expire_minutes


def _slugify(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
    return s[:80] if s else "tenant"


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    stmt = (
        select(User)
        .where(User.email == email)
        .options(selectinload(User.roles))
    )
    user = db.scalars(stmt).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def find_user_by_email(db: Session, email: str) -> User | None:
    return db.scalars(select(User).where(User.email == email)).first()


def issue_auth_response_data(
    db: Session,
    user: User,
    *,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> dict:
    from app.services.security_service import clear_login_failures, create_refresh_token

    clear_login_failures(db, user)
    access = create_access_token({"sub": str(user.id), "email": user.email})
    refresh = create_refresh_token(db, user, ip_address=ip_address, user_agent=user_agent)
    user_data = get_user_with_role(db, user)
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": user_data,
    }


def get_user_with_role(db: Session, user: User) -> dict:
    db.refresh(user, ["roles", "tenant"])
    role_names = [r.name for r in user.roles]
    permissions = sorted({p for r in user.roles for p in (r.permissions or [])})
    role_name = role_names[0] if role_names else "Operator"
    tenant_name = user.tenant.name if user.tenant else None
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "tenant_id": user.tenant_id,
        "tenant_name": tenant_name,
        "role": role_name,
        "roles": role_names,
        "permissions": permissions,
        "plant_code": getattr(user, "plant_code", None),
        "department": getattr(user, "department", None),
        "assigned_machine_id": getattr(user, "assigned_machine_id", None),
    }


def register_user(
    db: Session,
    company_name: str,
    full_name: str,
    email: str,
    password: str,
    role: str = "Admin",
) -> User:
    existing = db.scalars(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    base_name = company_name.strip()[:255]
    slug_base = _slugify(company_name)
    display_name = base_name
    slug = slug_base
    n = 0
    while True:
        name_taken = db.scalars(select(Tenant).where(Tenant.name == display_name)).first()
        slug_taken = db.scalars(select(Tenant).where(Tenant.slug == slug)).first()
        if not name_taken and not slug_taken:
            break
        n += 1
        slug = f"{slug_base}-{n}"
        display_name = f"{base_name} ({n})"[:255]

    try:
        tenant = Tenant(name=display_name, slug=slug)
        db.add(tenant)
        db.flush()

        seed_roles_for_tenant(db, tenant.id)
        target_role = db.scalars(
            select(Role).where(Role.tenant_id == tenant.id, Role.name == role)
        ).first()
        if not target_role:
            target_role = db.scalars(
                select(Role).where(Role.tenant_id == tenant.id, Role.name == "Admin")
            ).first()
        if not target_role:
            raise HTTPException(status_code=500, detail="Failed to provision administrator role")

        user = User(
            tenant_id=tenant.id,
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=not _settings.email_verification_required,
            email_verified=not _settings.email_verification_required,
        )
        db.add(user)
        user.roles.append(target_role)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create company account. Try a different company or email.",
        )
