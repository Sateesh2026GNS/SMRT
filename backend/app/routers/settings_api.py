"""Settings API — Users, Roles, Permissions, Audit Logs.

Enterprise envelope at /api/settings/*. Legacy flat JSON remains at /admin/* for
existing frontend clients.
"""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_admin
from app.models.user import User
from app.schemas.rbac import RoleCreate, RolePermissionsUpdate, RoleUpdate, UserCreate, UserUpdate
from app.services.settings_service import SettingsService
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/settings", tags=["Settings"])


def _svc(db: Session, admin: User) -> SettingsService:
    return SettingsService(db, admin)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
@router.get("/users")
async def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return success_response("Users retrieved", _svc(db, admin).list_users())


@router.get("/users/stats")
async def user_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return success_response("User statistics retrieved", _svc(db, admin).user_stats())


@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return success_response("User retrieved", _svc(db, admin).get_user(user_id))


@router.post("/users", status_code=201)
async def create_user(
    payload: UserCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = _svc(db, admin).create_user(payload, request)
    return success_response("User created", user)


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    payload: UserUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = _svc(db, admin).update_user(user_id, payload, request)
    return success_response("User updated", user)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    data = _svc(db, admin).delete_user(user_id, request)
    return success_response("User deleted", data)


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------
@router.get("/roles")
async def list_roles(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return success_response("Roles retrieved", _svc(db, admin).list_roles())


@router.get("/roles/{role_id}")
async def get_role(
    role_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return success_response("Role retrieved", _svc(db, admin).get_role(role_id))


@router.post("/roles", status_code=201)
async def create_role(
    payload: RoleCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role = _svc(db, admin).create_role(payload, request)
    return success_response("Role created", role)


@router.put("/roles/{role_id}")
async def update_role(
    role_id: int,
    payload: RoleUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role = _svc(db, admin).update_role(role_id, payload, request)
    return success_response("Role updated", role)


@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    data = _svc(db, admin).delete_role(role_id, request)
    return success_response("Role deleted", data)


# ---------------------------------------------------------------------------
# Permissions
# ---------------------------------------------------------------------------
@router.get("/permissions/modules")
async def list_modules(admin: User = Depends(require_admin)):
    return success_response("Permission modules retrieved", SettingsService.list_modules())


@router.get("/permissions/matrix")
async def permission_matrix(admin: User = Depends(require_admin)):
    return success_response(
        "Permission matrix retrieved", SettingsService.permission_matrix()
    )


@router.get("/permissions")
async def list_permissions(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return success_response(
        "Role permissions retrieved", _svc(db, admin).list_permissions_by_role()
    )


@router.put("/permissions/{role_id}")
async def update_permissions(
    role_id: int,
    payload: RolePermissionsUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role = _svc(db, admin).update_role_permissions(role_id, payload, request)
    return success_response("Role permissions updated", role)


# ---------------------------------------------------------------------------
# Audit logs
# ---------------------------------------------------------------------------
@router.get("/audit-logs")
async def audit_logs(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    data = _svc(db, admin).list_audit_logs(
        search=search, page=page, page_size=page_size
    )
    return success_response("Audit logs retrieved", data)
