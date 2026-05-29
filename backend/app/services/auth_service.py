import os
import re
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.seed_roles import MODULES
from app.models.role import Role
from app.models.tenant import Tenant
from app.models.user import User, user_roles

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production-use-openssl-rand-hex-32")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


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
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_user_with_role(db: Session, user: User) -> dict:
    db.refresh(user, ["roles", "tenant"])
    role_name = user.roles[0].name if user.roles else "Operator"
    tenant_name = user.tenant.name if user.tenant else None
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "tenant_id": user.tenant_id,
        "tenant_name": tenant_name,
        "role": role_name,
    }


def register_user(
    db: Session,
    company_name: str,
    full_name: str,
    email: str,
    password: str,
) -> User:
    # Unique email globally for simplicity (first tenant wins) — or per-tenant only
    existing = db.scalars(select(User).where(User.email == email)).first()
    if existing:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    slug_base = _slugify(company_name)
    slug = slug_base
    n = 0
    while db.scalars(select(Tenant).where(Tenant.slug == slug)).first():
        n += 1
        slug = f"{slug_base}-{n}"

    tenant = Tenant(name=company_name[:255], slug=slug)
    db.add(tenant)
    db.flush()

    admin_role = Role(
        tenant_id=tenant.id,
        name="Admin",
        description="Full system access",
        permissions=list(MODULES),
    )
    db.add(admin_role)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
        is_active=True,
    )
    db.add(user)
    db.flush()
    db.execute(
        user_roles.insert().values(user_id=user.id, role_id=admin_role.id)
    )
    db.commit()
    db.refresh(user)
    return user
