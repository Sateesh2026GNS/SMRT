"""FastAPI dependencies for GNS Super Admin platform routes."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.platform import PlatformSuperAdmin
from app.services.auth_service import decode_access_token

_bearer = HTTPBearer(auto_error=False)


def get_current_super_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> PlatformSuperAdmin:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or payload.get("token_type") != "platform_admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired platform admin token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin_id = payload.get("admin_id")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid platform admin token.",
        )

    admin = db.scalars(
        select(PlatformSuperAdmin).where(PlatformSuperAdmin.id == admin_id)
    ).first()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Super Admin account not found or inactive.",
        )
    return admin
