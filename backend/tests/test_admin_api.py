"""Settings / Admin API tests."""

import uuid


def _login_admin(client):
    from app.core.database import SessionLocal
    from app.core.seed_roles import seed_roles
    from app.core.seed_tenant import seed_tenant
    from app.core.seed_users import seed_admin_user

    db = SessionLocal()
    try:
        seed_tenant(db)
        seed_roles(db)
        seed_admin_user(db)
    finally:
        db.close()

    resp = client.post(
        "/auth/login",
        json={"email": "admin@smrt.local", "password": "admin123"},
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _unwrap(response):
    body = response.json()
    if isinstance(body, dict) and "success" in body:
        assert body["success"] is True
        return body["data"]
    return body


def test_admin_users_crud(client):
    headers = _login_admin(client)

    stats = client.get("/admin/users/stats", headers=headers)
    assert stats.status_code == 200
    stats_data = stats.json()
    assert stats_data["total_users"] >= 6
    assert stats_data["active_users"] >= 6
    assert stats_data["administrators"] >= 1

    roles = client.get("/admin/roles", headers=headers).json()
    email = f"settings-{uuid.uuid4().hex[:8]}@example.com"

    create = client.post(
        "/admin/users",
        headers=headers,
        json={
            "full_name": "Settings Test User",
            "email": email,
            "phone": "6302828004",
            "password": "demo1234",
            "is_active": True,
            "role_ids": [roles[0]["id"]],
        },
    )
    assert create.status_code == 201, create.text
    created = create.json()
    assert created["email"] == email

    update = client.put(
        f"/admin/users/{created['id']}",
        headers=headers,
        json={"full_name": "Settings Updated"},
    )
    assert update.status_code == 200
    assert update.json()["full_name"] == "Settings Updated"


def test_admin_roles_and_permissions(client):
    headers = _login_admin(client)

    modules = client.get("/admin/permissions/modules", headers=headers)
    assert modules.status_code == 200
    assert len(modules.json()) >= 10

    roles = client.get("/admin/roles", headers=headers).json()
    store_role = next(r for r in roles if r["name"] == "Store Manager")

    updated = client.put(
        f"/admin/roles/{store_role['id']}/permissions",
        headers=headers,
        json={"permissions": ["dashboard", "inventory", "procurement", "alerts"]},
    )
    assert updated.status_code == 200
    assert "inventory" in updated.json()["permissions"]


def test_settings_api_envelope(client):
    headers = _login_admin(client)

    resp = client.get("/api/settings/users/stats", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["total_users"] >= 6

    perms = client.get("/api/settings/permissions", headers=headers)
    assert perms.status_code == 200
    roles = _unwrap(perms)
    assert len(roles) >= 6


def test_audit_logs(client):
    headers = _login_admin(client)

    client.post("/auth/login", json={"email": "hr@smrt.local", "password": "demo123"})

    logs = client.get("/admin/access-logs", headers=headers)
    assert logs.status_code == 200
    items = logs.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert any(l["action"] == "login" for l in items)

    envelope = client.get("/api/settings/audit-logs?page_size=10", headers=headers)
    assert envelope.status_code == 200
    data = _unwrap(envelope)
    assert "items" in data
    assert data["total"] >= 1


def test_admin_requires_admin_role(client, register_admin, make_restricted_user):
    admin = register_admin()
    tenant_id = admin["user"]["tenant_id"]
    limited = make_restricted_user(tenant_id, permissions=["production"])

    for path in ("/admin/users", "/api/settings/users"):
        resp = client.get(path, headers=limited["headers"])
        assert resp.status_code == 403
