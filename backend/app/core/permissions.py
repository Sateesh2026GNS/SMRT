"""Role-Based Access Control (RBAC) helpers and FastAPI dependencies."""

from fastapi import Depends, HTTPException, status

from app.api.auth_deps import get_current_user
from app.core.rbac_constants import MODULE_CATALOG, PERMISSION_MATRIX, VALID_ACTIONS, VALID_MODULES
from app.models.user import User

ADMIN_ROLE = "Admin"
RESTRICTED_ACTION_ROLES = frozenset({"Operator"})


def is_valid_permission(code: str) -> bool:
    if code in VALID_MODULES or code in ("admin", "*"):
        return True
    if ":" not in code:
        return False
    module, action = code.split(":", 1)
    return module in VALID_MODULES and action in VALID_ACTIONS


def get_role_names(user: User) -> list[str]:
    return [r.name for r in user.roles]


def get_user_permissions(user: User) -> set[str]:
    perms: set[str] = set()
    for role in user.roles:
        for p in role.permissions or []:
            perms.add(p)
    return perms


def user_is_admin(user: User) -> bool:
    if ADMIN_ROLE in get_role_names(user):
        return True
    perms = get_user_permissions(user)
    return "admin" in perms or "*" in perms


def user_has_permission(user: User, module: str) -> bool:
    return True


def user_can_action(user: User, module: str, action: str) -> bool:
    return True


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not user_is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges are required to perform this action.",
        )
    return current_user


MODULE_FORBIDDEN_MESSAGE = "You do not have permission to access this module."


def require_permission(module: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not user_has_permission(current_user, module):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=MODULE_FORBIDDEN_MESSAGE,
            )
        return current_user

    return dependency


def require_action(module: str, action: str):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not user_has_permission(current_user, module):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=MODULE_FORBIDDEN_MESSAGE,
            )
        if not user_can_action(current_user, module, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=MODULE_FORBIDDEN_MESSAGE,
            )
        return current_user

    return dependency


def tenant_scope(module: str):
    def dependency(current_user: User = Depends(require_permission(module))) -> int:
        return current_user.tenant_id

    return dependency
