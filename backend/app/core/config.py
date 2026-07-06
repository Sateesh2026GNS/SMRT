from pathlib import Path

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# .env path relative to backend/
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_env_path, extra="ignore")

    # Database (SQLite only)
    database_url: str = "sqlite:///./smrt.db"

    # Auth / JWT
    jwt_secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    session_inactivity_minutes: int = 120

    # Login lockout
    max_login_attempts: int = 5
    lockout_minutes: int = 30

    # Email verification & password reset
    email_verification_expire_hours: int = 24
    password_reset_expire_minutes: int = 30
    frontend_base_url: str = "http://localhost:5173"

    # SMTP (optional — logs to console in development when unset)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@smrt.local"

    # Environment: "development" | "production"
    environment: str = "development"

    # CORS: comma-separated list of allowed origins
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @field_validator("database_url")
    @classmethod
    def require_sqlite(cls, value: str) -> str:
        if not value.strip().lower().startswith("sqlite:"):
            raise ValueError(
                "Only SQLite DATABASE_URL is supported (e.g. sqlite:///./smrt.db)"
            )
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def email_verification_required(self) -> bool:
        return self.is_production


@lru_cache
def get_settings() -> Settings:
    return Settings()
