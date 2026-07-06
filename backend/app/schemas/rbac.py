"""Request schemas for admin user & role management (RBAC)."""

from pydantic import BaseModel, EmailStr, Field


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
