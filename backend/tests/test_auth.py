def test_register_and_me(client, register_admin):
    ctx = register_admin()
    assert ctx["user"]["role"] == "Admin"

    resp = client.get("/auth/me", headers=ctx["headers"])
    assert resp.status_code == 200
    assert resp.json()["email"] == ctx["email"]


def test_login_success(client, register_admin):
    ctx = register_admin()
    resp = client.post(
        "/auth/login", json={"email": ctx["email"], "password": ctx["password"]}
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client, register_admin):
    ctx = register_admin()
    resp = client.post(
        "/auth/login", json={"email": ctx["email"], "password": "wrong-password"}
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid Credentials"


def test_login_lockout_after_five_failures(client, register_admin):
    ctx = register_admin()
    for _ in range(5):
        client.post(
            "/auth/login", json={"email": ctx["email"], "password": "wrong-password"}
        )
    resp = client.post(
        "/auth/login", json={"email": ctx["email"], "password": "wrong-password"}
    )
    assert resp.status_code == 429


def test_refresh_token_rotation(client, register_admin):
    ctx = register_admin()
    login = client.post(
        "/auth/login", json={"email": ctx["email"], "password": ctx["password"]}
    )
    assert login.status_code == 200
    body = login.json()
    assert "refresh_token" in body
    refreshed = client.post(
        "/auth/refresh", json={"refresh_token": body["refresh_token"]}
    )
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]


def test_forgot_password_generic_response(client):
    resp = client.post(
        "/auth/forgot-password", json={"email": "nobody@example.com"}
    )
    assert resp.status_code == 200
    assert "reset link" in resp.json()["message"].lower()


def test_protected_route_requires_token(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 401


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200


def test_register_duplicate_company_name_succeeds(client):
    """Two companies with the same display name must both register successfully."""
    first = client.post(
        "/auth/register",
        json={
            "company_name": "GNS",
            "full_name": "First Admin",
            "email": "first-gns@test.com",
            "password": "Passw0rd!123",
        },
    )
    second = client.post(
        "/auth/register",
        json={
            "company_name": "GNS",
            "full_name": "Second Admin",
            "email": "second-gns@test.com",
            "password": "Passw0rd!123",
        },
    )
    assert first.status_code == 200, first.text
    assert second.status_code == 200, second.text
    assert second.json()["user"]["tenant_name"] != first.json()["user"]["tenant_name"]
