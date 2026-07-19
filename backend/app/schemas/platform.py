"""Pydantic schemas for GNS Super Admin platform API."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

from app.utils.password import validate_password_strength
from app.utils.sanitize import sanitize_email_local_part, sanitize_text


def _normalize_email(value: str) -> str:
    email = sanitize_email_local_part(value).lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise ValueError("Invalid email address")
    local, _, domain = email.partition("@")
    if not local or not domain or "." not in domain:
        raise ValueError("Invalid email address")
    return email


class SuperAdminLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return _normalize_email(value)


class SuperAdminLoginChallengeResponse(BaseModel):
    challenge_token: str
    masked_mobile: str
    expires_in_seconds: int = 300
    resend_after_seconds: int = 60
    message: str = "OTP sent to your registered mobile number."
    # Present only in development when SMS is not configured
    dev_otp: str | None = None


class SuperAdminVerifyOtpRequest(BaseModel):
    challenge_token: str = Field(..., min_length=16, max_length=64)
    otp: str = Field(..., min_length=6, max_length=6)

    @field_validator("otp")
    @classmethod
    def digits_only(cls, value: str) -> str:
        cleaned = "".join(c for c in value if c.isdigit())
        if len(cleaned) != 6:
            raise ValueError("OTP must be a 6-digit code")
        return cleaned


class SuperAdminResendOtpRequest(BaseModel):
    challenge_token: str = Field(..., min_length=16, max_length=64)


class SuperAdminAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: dict
    role: str = "GNS Super Admin"
    dashboard_path: str = "/gns-admin"


class CreateCompanyRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    company_email: str = Field(..., min_length=3, max_length=255)
    admin_name: str = Field(..., min_length=1, max_length=255)
    admin_email: str = Field(..., min_length=3, max_length=255)
    mobile_number: str = Field(..., min_length=8, max_length=20)
    gst_number: str | None = Field(None, max_length=64)
    address: str = Field(..., min_length=1, max_length=512)
    city: str = Field(..., min_length=1, max_length=128)
    state: str = Field(..., min_length=1, max_length=128)
    country: str = Field(..., min_length=1, max_length=128)
    pin_code: str = Field(..., min_length=4, max_length=16)
    subscription_plan: str = Field(..., min_length=1, max_length=64)
    trial_days: int = Field(default=5, ge=0, le=365)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("company_name", "admin_name", "address", "city", "state", "country")
    @classmethod
    def sanitize_text_fields(cls, value: str) -> str:
        cleaned = sanitize_text(value, max_length=512)
        if not cleaned:
            raise ValueError("Required field")
        return cleaned

    @field_validator("company_email", "admin_email")
    @classmethod
    def validate_emails(cls, value: str) -> str:
        return _normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        validate_password_strength(value)
        return value

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Password and confirm password do not match")
        return self


class UpdateCompanyRequest(BaseModel):
    company_name: str | None = Field(None, min_length=1, max_length=255)
    company_email: str | None = Field(None, min_length=3, max_length=255)
    mobile_number: str | None = Field(None, min_length=8, max_length=20)
    gst_number: str | None = Field(None, max_length=64)
    address: str | None = Field(None, max_length=512)
    city: str | None = Field(None, max_length=128)
    state: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    pin_code: str | None = Field(None, max_length=16)
    subscription_plan: str | None = Field(None, max_length=64)
    trial_days: int | None = Field(None, ge=0, le=365)
    status: str | None = Field(None, max_length=32)


class ResetCompanyPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        validate_password_strength(value)
        return value


class UpdateLicenseRequest(BaseModel):
    plan: str | None = Field(None, max_length=64)
    status: str | None = Field(None, max_length=32)
    max_users: int | None = Field(None, ge=1, le=10000)
    expires_at: datetime | None = None


class CompanyResponse(BaseModel):
    id: int
    company_code: str | None
    company_name: str
    company_email: str | None
    mobile_number: str | None
    gst_number: str | None
    address: str | None
    city: str | None
    state: str | None
    country: str | None
    pin_code: str | None
    status: str
    subscription_plan: str | None
    trial_days: int | None
    trial_expires_at: datetime | None
    license_status: str | None
    admin_name: str | None = None
    admin_email: str | None = None
    user_count: int = 0
    created_at: datetime | None = None


class CreateCompanyResponse(BaseModel):
    company: CompanyResponse
    company_id: str
    admin_email: str
    temporary_password: str
    message: str
