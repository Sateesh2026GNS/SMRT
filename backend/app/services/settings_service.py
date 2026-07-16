"""Settings (Admin) service — users, roles, permissions, audit logs."""

from __future__ import annotations

from fastapi import Request
from sqlalchemy.orm import Session

from app.core.rbac_constants import MODULE_CATALOG, PERMISSION_MATRIX
from app.models.user import User
from app.schemas.rbac import RoleCreate, RolePermissionsUpdate, RoleUpdate, UserCreate, UserUpdate
from app.services import rbac_service


class SettingsService:
    """Facade over RBAC operations for Settings / Admin module."""

    def __init__(self, db: Session, admin: User):
        self.db = db
        self.admin = admin
        self.tenant_id = admin.tenant_id

    # Users
    def list_users(self) -> list[dict]:
        return rbac_service.list_users(self.db, self.tenant_id)

    def get_user(self, user_id: int) -> dict:
        return rbac_service.get_user(self.db, self.tenant_id, user_id)

    def user_stats(self) -> dict:
        return rbac_service.get_user_stats(self.db, self.tenant_id)

    def create_user(self, payload: UserCreate, request: Request | None = None) -> dict:
        user = rbac_service.create_user(self.db, self.tenant_id, payload)
        self._log("create_user", "user", user["id"], request)
        return user

    def update_user(
        self, user_id: int, payload: UserUpdate, request: Request | None = None
    ) -> dict:
        user = rbac_service.update_user(
            self.db, self.tenant_id, user_id, payload, self.admin
        )
        self._log("update_user", "user", user_id, request)
        return user

    def delete_user(self, user_id: int, request: Request | None = None) -> dict:
        rbac_service.delete_user(self.db, self.tenant_id, user_id, self.admin)
        self._log("delete_user", "user", user_id, request)
        return {"deleted": True, "id": user_id}

    # Roles
    def list_roles(self) -> list[dict]:
        return rbac_service.list_roles(self.db, self.tenant_id)

    def get_role(self, role_id: int) -> dict:
        return rbac_service.get_role(self.db, self.tenant_id, role_id)

    def create_role(self, payload: RoleCreate, request: Request | None = None) -> dict:
        role = rbac_service.create_role(self.db, self.tenant_id, payload)
        self._log("create_role", "role", role["id"], request)
        return role

    def update_role(
        self, role_id: int, payload: RoleUpdate, request: Request | None = None
    ) -> dict:
        role = rbac_service.update_role(self.db, self.tenant_id, role_id, payload)
        self._log("update_role", "role", role_id, request)
        return role

    def update_role_permissions(
        self,
        role_id: int,
        payload: RolePermissionsUpdate,
        request: Request | None = None,
    ) -> dict:
        role = rbac_service.update_role_permissions(
            self.db, self.tenant_id, role_id, payload.permissions
        )
        self._log("update_role_permissions", "role", role_id, request)
        return role

    def delete_role(self, role_id: int, request: Request | None = None) -> dict:
        rbac_service.delete_role(self.db, self.tenant_id, role_id)
        self._log("delete_role", "role", role_id, request)
        return {"deleted": True, "id": role_id}

    # Permissions catalogue
    @staticmethod
    def list_modules() -> list[dict]:
        return MODULE_CATALOG

    @staticmethod
    def permission_matrix() -> dict:
        return PERMISSION_MATRIX

    def list_permissions_by_role(self) -> list[dict]:
        return self.list_roles()

    # Audit logs
    def list_audit_logs(
        self,
        *,
        search: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> dict:
        return rbac_service.list_activities(
            self.db,
            self.tenant_id,
            search=search,
            page=page,
            page_size=page_size,
        )

    def _log(
        self,
        action: str,
        resource: str,
        resource_id: int | None,
        request: Request | None,
    ) -> None:
        rbac_service.log_activity(
            self.db,
            tenant_id=self.tenant_id,
            user_id=self.admin.id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            request=request,
        )
