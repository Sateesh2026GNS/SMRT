def test_register_and_me(client, register_admin):
    ctx = register_admin()
    assert ctx["user"]["role"] == "Admin"

    resp = client.get("/auth/me", headers=ctx["headers"])
    assert resp.status_code == 200
    assert resp.json()["email"] == ctx["email"]


def test_register_does_not_return_jwt(client):
    import uuid

    email = f"admin-{uuid.uuid4().hex[:8]}@acme-mfg.test"
    resp = client.post(
        "/auth/register",
        json={
            "company_name": f"Acme {uuid.uuid4().hex[:4]}",
            "full_name": "Admin User",
            "email": email,
            "password": "Passw0rd!123",
            "role": "Admin",
        },
    )
    assert resp.status_code in (200, 201), resp.text
    body = resp.json()
    assert "access_token" not in body
    assert "refresh_token" not in body
    assert "Registration completed successfully" in body["message"]


def test_login_success(client, register_admin):
    ctx = register_admin()
    resp = client.post(
        "/auth/login", json={"email": ctx["email"], "password": ctx["password"], "role": "Admin"}
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    payload_user = resp.json()["user"]
    assert payload_user["role_id"] is not None
    assert payload_user["company_id"] is not None


def test_login_wrong_password(client, register_admin):
    ctx = register_admin()
    resp = client.post(
        "/auth/login", json={"email": ctx["email"], "password": "wrong-password", "role": "Admin"}
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Incorrect password."


def test_login_role_mismatch(client, register_admin):
    ctx = register_admin()
    resp = client.post(
        "/auth/login",
        json={"email": ctx["email"], "password": ctx["password"], "role": "Operator"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == (
        "The selected role does not match your account. Please choose the correct role."
    )


def test_login_email_not_found(client):
    resp = client.post(
        "/auth/login",
        json={"email": "nobody@unknown-corp.example", "password": "Passw0rd!123", "role": "Admin"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Email address not found."


def test_login_email_not_with_company(client, register_admin):
    ctx = register_admin()
    domain = ctx["email"].split("@", 1)[1]
    resp = client.post(
        "/auth/login",
        json={"email": f"ghost@{domain}", "password": "Passw0rd!123", "role": "Admin"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"] == "This email address is not registered with your company."


def test_login_lockout_after_five_failures(client, register_admin):
    ctx = register_admin()
    for _ in range(5):
        client.post(
            "/auth/login", json={"email": ctx["email"], "password": "wrong-password", "role": "Admin"}
        )
    resp = client.post(
        "/auth/login", json={"email": ctx["email"], "password": "wrong-password", "role": "Admin"}
    )
    assert resp.status_code == 429


def test_refresh_token_rotation(client, register_admin):
    ctx = register_admin()
    login = client.post(
        "/auth/login", json={"email": ctx["email"], "password": ctx["password"], "role": "Admin"}
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
    assert resp.status_code == 404
    assert "email" in resp.json()["detail"].lower()


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
            "email": "first-gns@acme1.test",
            "password": "Passw0rd!123",
        },
    )
    second = client.post(
        "/auth/register",
        json={
            "company_name": "GNS",
            "full_name": "Second Admin",
            "email": "second-gns@acme2.test",
            "password": "Passw0rd!123",
        },
    )
    assert first.status_code in (200, 201), first.text
    assert second.status_code in (200, 201), second.text

    login1 = client.post(
        "/auth/login",
        json={"email": "first-gns@acme1.test", "password": "Passw0rd!123", "role": "Admin"},
    )
    login2 = client.post(
        "/auth/login",
        json={"email": "second-gns@acme2.test", "password": "Passw0rd!123", "role": "Admin"},
    )
    assert login1.status_code == 200
    assert login2.status_code == 200
    assert login1.json()["user"]["tenant_name"] != login2.json()["user"]["tenant_name"]


def test_register_rejects_public_email(client):
    resp = client.post(
        "/auth/register",
        json={
            "company_name": "Bad Corp",
            "full_name": "Random User",
            "email": "random@gmail.com",
            "password": "Passw0rd!123",
        },
    )
    assert resp.status_code == 400
    assert "company email" in resp.json()["detail"].lower()


def test_register_blocks_duplicate_name_and_email(client):
    """Same full name + same company email must not register twice."""
    import uuid

    suffix = uuid.uuid4().hex[:8]
    email = f"hr-{suffix}@company1.test"
    payload = {
        "company_name": f"Company One {suffix}",
        "full_name": "Sathish",
        "email": email,
        "password": "Passw0rd!123",
    }
    first = client.post("/auth/register", json=payload)
    assert first.status_code in (200, 201), first.text

    duplicate = client.post(
        "/auth/register",
        json={
            **payload,
            "company_name": f"Company Two {suffix}",
        },
    )
    assert duplicate.status_code == 409
    body = duplicate.json()
    assert body["success"] is False
    assert body["message"] == "This user is already registered with this company email."


def test_register_allows_same_name_different_email(client):
    """Same name with a different company email should succeed."""
    import uuid

    suffix = uuid.uuid4().hex[:8]
    first = client.post(
        "/auth/register",
        json={
            "company_name": f"Company One {suffix}",
            "full_name": "Sathish",
            "email": f"hr-{suffix}@company1.test",
            "password": "Passw0rd!123",
        },
    )
    second = client.post(
        "/auth/register",
        json={
            "company_name": f"Company Two {suffix}",
            "full_name": "Sathish",
            "email": f"hr-{suffix}@company2.test",
            "password": "Passw0rd!123",
        },
    )
    assert first.status_code in (200, 201), first.text
    assert second.status_code in (200, 201), second.text


def test_register_allows_different_name_same_email(client):
    """Different name with the same company email should succeed."""
    import uuid

    suffix = uuid.uuid4().hex[:8]
    shared_email = f"hr-{suffix}@company.test"
    first = client.post(
        "/auth/register",
        json={
            "company_name": f"Company One {suffix}",
            "full_name": "Sathish",
            "email": shared_email,
            "password": "Passw0rd!123",
        },
    )
    second = client.post(
        "/auth/register",
        json={
            "company_name": f"Company Two {suffix}",
            "full_name": "Ramesh",
            "email": shared_email,
            "password": "Passw0rd!123",
        },
    )
    assert first.status_code in (200, 201), first.text
    assert second.status_code in (200, 201), second.text


def test_register_allows_different_name_and_email(client):
    """Unrelated name and email should always succeed."""
    import uuid

    suffix = uuid.uuid4().hex[:8]
    resp = client.post(
        "/auth/register",
        json={
            "company_name": f"New Corp {suffix}",
            "full_name": f"User {suffix}",
            "email": f"user-{suffix}@corp-{suffix}.test",
            "password": "Passw0rd!123",
        },
    )
    assert resp.status_code in (200, 201), resp.text
