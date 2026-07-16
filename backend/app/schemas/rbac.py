"""Request schemas for admin user & role management (RBAC)."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=20)
    password: str = Field(..., min_length=6, max_length=128)
    is_active: bool = True
    role_ids: list[int] = Field(default_factory=list)
    plant_code: str | None = Field(None, max_length=64)
    department: str | None = Field(None, max_length=128)
    assigned_machine_id: int | None = None


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(None, min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=20)
    password: str | None = Field(None, min_length=6, max_length=128)
    is_active: bool | None = None
    role_ids: list[int] | None = None
    plant_code: str | None = Field(None, max_length=64)
    department: str | None = Field(None, max_length=128)
    assigned_machine_id: int | None = None


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=255)
    permissions: list[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=255)
    permissions: list[str] | None = None


<<<<<<< HEAD
class RolePermissionsUpdate(BaseModel):
    permissions: list[str] = Field(default_factory=list)
=======
class RoleRead(BaseModel):
    id: int
    tenant_id: int
    name: str
    description: str | None = None
    permissions: list[str] = []

    model_config = ConfigDict(from_attributes=True)


class UserRoleRead(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    id: int
    tenant_id: int
    email: str
    full_name: str
    phone: str | None = None
    is_active: bool
    email_verified: bool
    plant_code: str | None = None
    department: str | None = None
    assigned_machine_id: int | None = None
    roles: list[UserRoleRead] = []

    model_config = ConfigDict(from_attributes=True)


class PermissionModuleRead(BaseModel):
    code: str
    label: str


class AccessLogRead(BaseModel):
    id: int
    tenant_id: int
    user_id: int | None = None
    action: str
    resource: str | None = None
    resource_id: int | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    logged_at: datetime

    model_config = ConfigDict(from_attributes=True)
>>>>>>> 42502626 (first commit)
