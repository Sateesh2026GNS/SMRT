"""Password reset flow tests."""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.role import Role
from app.models.security import PasswordResetToken
from app.models.tenant import Tenant
from app.models.user import User, user_roles
from app.repositories.auth_repository import AuthRepository
from app.services.auth_service import hash_password
from app.services.email_service import EmailDeliveryError
from app.utils.token import hash_token


def _create_user(*, email: str | None = None, password: str = "OldPass@123", active: bool = True):
    email = email or f"reset-{uuid.uuid4().hex[:8]}@corp-reset.test"
    db = SessionLocal()
    try:
        code = uuid.uuid4().hex[:8]
        tenant = Tenant(
            name=f"Reset Co {code}",
            slug=f"reset-co-{code}",
            company_code=f"RC{code.upper()}",
            status="active",
        )
        db.add(tenant)
        db.flush()
        role = Role(
            tenant_id=tenant.id,
            name="Operator",
            description="Operator",
            permissions=["dashboard:view"],
        )
        db.add(role)
        db.flush()
        user = User(
            tenant_id=tenant.id,
            email=email.lower(),
            full_name="Reset User",
            hashed_password=hash_password(password),
            is_active=active,
            email_verified=True,
        )
        db.add(user)
        db.flush()
        db.execute(user_roles.insert().values(user_id=user.id, role_id=role.id))
        db.commit()
        return email, password, user.id, tenant.id
    finally:
        db.close()


def _issue_reset_token(email: str) -> str:
    db = SessionLocal()
    try:
        repo = AuthRepository(db)
        user = repo.get_user_by_email(email)
        assert user is not None
        raw = repo.create_password_reset_token(
            user.id,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        )
        repo.commit()
        return raw
    finally:
        db.close()


def _api_error_detail(resp) -> str:
    body = resp.json()
    if "detail" in body:
        return body["detail"]
    if body.get("errors"):
        errs = body["errors"]
        return errs[0] if isinstance(errs, list) else str(errs)
    return body.get("message", "")


@pytest.fixture
def mock_reset_email(monkeypatch):
    """Simulate successful SMTP delivery for forgot-password tests."""
    send = AsyncMock(return_value=None)
    monkeypatch.setattr(
        "app.services.password_reset_service.send_password_reset_email_async",
        send,
    )
    monkeypatch.setattr(
        "app.services.password_reset_service.send_password_reset_email",
        lambda *a, **k: None,
    )
    return send


def test_forgot_password_not_found(client, mock_reset_email):
    resp = client.post(
        "/api/auth/forgot-password",
        json={"email": "missing@corp-reset.test"},
    )
    assert resp.status_code == 404
    body = resp.json()
    assert body.get("success") is False
    assert _api_error_detail(resp) == "No account found with this email address."
    mock_reset_email.assert_not_awaited()


def test_forgot_password_inactive_account(client, mock_reset_email):
    email, _, _, _ = _create_user(active=False)
    resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert resp.status_code == 403
    assert _api_error_detail(resp) == "Your account is inactive. Please contact your administrator."


def test_forgot_password_success_envelope(client, mock_reset_email, monkeypatch):
    monkeypatch.setattr(
        "app.services.password_reset_service.smtp_is_configured",
        lambda: True,
    )
    email, _, _, _ = _create_user()
    resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["success"] is True
    assert body["message"] == "Password reset link sent successfully."
    mock_reset_email.assert_awaited_once()


def test_forgot_password_smtp_failure_no_fake_success(client, monkeypatch):
    email, _, _, _ = _create_user()

    monkeypatch.setattr(
        "app.services.password_reset_service.smtp_is_configured",
        lambda: True,
    )

    async def _fail(*_a, **_k):
        raise EmailDeliveryError("Failed to send password reset email.")

    monkeypatch.setattr(
        "app.services.password_reset_service.send_password_reset_email_async",
        _fail,
    )

    resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert resp.status_code == 500
    assert "Failed to send password reset email." in _api_error_detail(resp)
    body = resp.json()
    assert body.get("success") is False


def test_forgot_password_smtp_not_configured_message(client, monkeypatch):
    email, _, _, _ = _create_user()
    monkeypatch.setattr(
        "app.services.password_reset_service.smtp_is_configured",
        lambda: False,
    )
    monkeypatch.setattr(
        "app.services.password_reset_service.smtp_config_error_message",
        lambda: "Email server is not configured. Set SMTP_PASSWORD in backend/.env, then restart the backend.",
    )
    resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert resp.status_code == 500
    assert "SMTP_PASSWORD" in _api_error_detail(resp)


def test_reset_password_full_flow(client):
    email, old_password, _, _ = _create_user()
    raw = _issue_reset_token(email)

    weak = client.post(
        "/api/auth/reset-password",
        json={"token": raw, "password": "short"},
    )
    assert weak.status_code == 422

    reset = client.post(
        "/api/auth/reset-password",
        json={"token": raw, "password": "NewSecure@99"},
    )
    assert reset.status_code == 200, reset.text
    body = reset.json()
    assert body["success"] is True
    assert "changed successfully" in body["message"].lower()

    db = SessionLocal()
    try:
        remaining = db.scalars(
            select(PasswordResetToken).where(
                PasswordResetToken.token_hash == hash_token(raw)
            )
        ).first()
        assert remaining is None
    finally:
        db.close()

    login_old = client.post("/auth/login", json={"email": email, "password": old_password, "role": "Admin"})
    assert login_old.status_code == 401

    login_new = client.post("/auth/login", json={"email": email, "password": "NewSecure@99", "role": "Admin"})
    assert login_new.status_code == 200

    reuse = client.post(
        "/api/auth/reset-password",
        json={"token": raw, "password": "Another@99"},
    )
    assert reuse.status_code == 400
    assert "invalid" in _api_error_detail(reuse).lower()


def test_validate_reset_token_expired(client):
    email, _, _, _ = _create_user()
    db = SessionLocal()
    try:
        repo = AuthRepository(db)
        user = repo.get_user_by_email(email)
        raw = repo.create_password_reset_token(
            user.id,
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )
        repo.commit()
    finally:
        db.close()

    resp = client.get("/api/auth/validate-reset-token", params={"token": raw})
    assert resp.status_code == 400
    assert "expired" in _api_error_detail(resp).lower()


def test_reset_password_expired_token(client):
    email, _, _, _ = _create_user()
    db = SessionLocal()
    try:
        repo = AuthRepository(db)
        user = repo.get_user_by_email(email)
        raw = repo.create_password_reset_token(
            user.id,
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )
        repo.commit()
    finally:
        db.close()

    resp = client.post(
        "/api/auth/reset-password",
        json={"token": raw, "password": "NewSecure@99"},
    )
    assert resp.status_code == 400
    assert "expired" in _api_error_detail(resp).lower()


def test_admin_reset_user_password(client, register_admin, mock_reset_email):
    admin = register_admin()
    users = client.get("/admin/users", headers=admin["headers"])
    assert users.status_code == 200
    rows = users.json()
    target = next(u for u in rows if u["email"] == admin["email"])
    resp = client.post(
        f"/api/users/{target['id']}/reset-password",
        headers=admin["headers"],
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["success"] is True
