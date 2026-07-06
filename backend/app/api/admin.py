"""Admin panel API: user & role management (RBAC), activity logs.

All endpoints require an authenticated administrator and are scoped to the
acting user's tenant. Other roles are rejected with 403.
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_admin
from app.core.rbac_constants import MODULE_CATALOG, PERMISSION_MATRIX
from app.models.user import User
from app.schemas.rbac import RoleCreate, RoleUpdate, UserCreate, UserUpdate
from app.services import rbac_service

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Permission catalogue
# ---------------------------------------------------------------------------
@router.get("/permissions/modules")
def list_modules(_: User = Depends(require_admin)):
    return MODULE_CATALOG


@router.get("/permissions/matrix")
def permission_matrix(_: User = Depends(require_admin)):
    return PERMISSION_MATRIX


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
@router.get("/users")
def list_users(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    return rbac_service.list_users(db, admin.tenant_id)


@router.get("/users/{user_id}")
def get_user(
    user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    return rbac_service.get_user(db, admin.tenant_id, user_id)


@router.post("/users", status_code=201)
def create_user(
    payload: UserCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = rbac_service.create_user(db, admin.tenant_id, payload)
    rbac_service.log_activity(
        db,
        tenant_id=admin.tenant_id,
        user_id=admin.id,
        action="create_user",
        resource="user",
        resource_id=user["id"],
        request=request,
    )
    return user


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = rbac_service.update_user(db, admin.tenant_id, user_id, payload, admin)
    rbac_service.log_activity(
        db,
        tenant_id=admin.tenant_id,
        user_id=admin.id,
        action="update_user",
        resource="user",
        resource_id=user_id,
        request=request,
    )
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    rbac_service.delete_user(db, admin.tenant_id, user_id, admin)
    rbac_service.log_activity(
        db,
        tenant_id=admin.tenant_id,
        user_id=admin.id,
        action="delete_user",
        resource="user",
        resource_id=user_id,
        request=request,
    )
    return {"deleted": True, "id": user_id}


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------
@router.get("/roles")
def list_roles(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    return rbac_service.list_roles(db, admin.tenant_id)


@router.get("/roles/{role_id}")
def get_role(
    role_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    return rbac_service.get_role(db, admin.tenant_id, role_id)


@router.post("/roles", status_code=201)
def create_role(
    payload: RoleCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role = rbac_service.create_role(db, admin.tenant_id, payload)
    rbac_service.log_activity(
        db,
        tenant_id=admin.tenant_id,
        user_id=admin.id,
        action="create_role",
        resource="role",
        resource_id=role["id"],
        request=request,
    )
    return role


@router.put("/roles/{role_id}")
def update_role(
    role_id: int,
    payload: RoleUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role = rbac_service.update_role(db, admin.tenant_id, role_id, payload)
    rbac_service.log_activity(
        db,
        tenant_id=admin.tenant_id,
        user_id=admin.id,
        action="update_role",
        resource="role",
        resource_id=role_id,
        request=request,
    )
    return role


@router.delete("/roles/{role_id}")
def delete_role(
    role_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    rbac_service.delete_role(db, admin.tenant_id, role_id)
    rbac_service.log_activity(
        db,
        tenant_id=admin.tenant_id,
        user_id=admin.id,
        action="delete_role",
        resource="role",
        resource_id=role_id,
        request=request,
    )
    return {"deleted": True, "id": role_id}


# ---------------------------------------------------------------------------
# Activity / access logs
# ---------------------------------------------------------------------------
@router.get("/access-logs")
def list_access_logs(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    return rbac_service.list_activities(db, admin.tenant_id)


# ---------------------------------------------------------------------------
# Pending approvals (admin dashboard)
# ---------------------------------------------------------------------------
@router.get("/approvals")
def pending_approvals(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    from app.services.approval_service import get_pending_approvals

    return get_pending_approvals(db, admin.tenant_id)
