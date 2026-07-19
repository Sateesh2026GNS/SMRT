"""Data access for authentication and password-reset tokens."""

from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.models.security import PasswordResetToken
from app.models.user import User
from app.utils.token import generate_token, hash_token


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.scalars(
            select(User)
            .where(User.email == email.lower().strip())
            .options(selectinload(User.tenant))
        ).first()

    def get_user_by_id(self, user_id: int, tenant_id: int | None = None) -> User | None:
        stmt = select(User).where(User.id == user_id)
        if tenant_id is not None:
            stmt = stmt.where(User.tenant_id == tenant_id)
        return self.db.scalars(stmt).first()

    def invalidate_active_reset_tokens(self, user_id: int) -> None:
        self.db.execute(
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.used.is_(False),
            )
            .values(used=True)
        )

    def create_password_reset_token(
        self, user_id: int, *, expires_at: datetime
    ) -> str:
        """Create a one-time reset token. Returns raw token for email link."""
        self.invalidate_active_reset_tokens(user_id)
        raw = generate_token()
        self.db.add(
            PasswordResetToken(
                user_id=user_id,
                token_hash=hash_token(raw),
                expires_at=expires_at,
                used=False,
            )
        )
        self.db.flush()
        return raw

    def get_reset_token_row(self, raw_token: str) -> PasswordResetToken | None:
        token_hash = hash_token(raw_token)
        return self.db.scalars(
            select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        ).first()

    def mark_reset_token_used(self, row: PasswordResetToken) -> None:
        row.used = True
        self.db.flush()

    def delete_reset_token(self, row: PasswordResetToken) -> None:
        """Permanently remove a reset token so it cannot be reused."""
        self.db.delete(row)
        self.db.flush()

    def update_user_password(self, user: User, hashed_password: str) -> None:
        user.hashed_password = hashed_password
        user.failed_login_attempts = 0
        user.locked_until = None
        self.db.flush()

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj) -> None:
        self.db.refresh(obj)
