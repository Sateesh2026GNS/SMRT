from pydantic import BaseModel, Field, field_validator

from app.utils.sanitize import sanitize_email_local_part, sanitize_text


def _normalize_email(value: str) -> str:
    email = sanitize_email_local_part(value).lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise ValueError("Invalid email address")
    local, _, domain = email.partition("@")
    if not local or not domain or "." not in domain:
        raise ValueError("Invalid email address")
    return email


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _normalize_email(value)


class RegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    full_name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field("Admin", min_length=1, max_length=100)

    @field_validator("company_name", "full_name")
    @classmethod
    def sanitize_names(cls, value: str) -> str:
        cleaned = sanitize_text(value, max_length=255)
        if not cleaned:
            raise ValueError("Required field")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _normalize_email(value)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _normalize_email(value)


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=16, max_length=512)
    password: str = Field(..., min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=16, max_length=512)


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=16, max_length=512)


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    tenant_id: int
    tenant_name: str | None = None
    role: str
    roles: list[str] = []
    permissions: list[str] = []
    email_verified: bool = True
    plant_code: str | None = None
    department: str | None = None
    assigned_machine_id: int | None = None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: UserResponse


class RegisterPendingResponse(BaseModel):
    message: str
    email_verification_required: bool = True
    verification_token: str | None = None  # development only


class MessageResponse(BaseModel):
    message: str
