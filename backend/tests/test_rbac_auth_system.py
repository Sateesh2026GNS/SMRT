"""RBAC registration, JWT claims, sidebar, and permission catalog tests."""

import base64
import json
import uuid


def _jwt_payload(token: str) -> dict:
    part = token.split(".")[1]
    pad = "=" * (-len(part) % 4)
    return json.loads(base64.urlsafe_b64decode(part + pad))


def _register_and_login(client, *, role="Operator", company=None):
    suffix = uuid.uuid4().hex[:6]
    email = f"{role.lower().replace(' ', '-')}-{suffix}@corp-{suffix}.test"
    company = company or f"Corp {suffix}"
    password = "Passw0rd!123"
    reg = client.post(
        "/auth/register",
        json={
            "company_name": company,
            "full_name": f"{role} User",
            "email": email,
            "password": password,
            "role": role,
        },
    )
    assert reg.status_code in (200, 201), reg.text
    assert "access_token" not in reg.json()
    login = client.post(
        "/auth/login",
        json={"email": email, "password": password, "role": role},
    )
    assert login.status_code == 200, login.text
    return login.json(), email


def test_list_registerable_roles(client):
    resp = client.get("/roles")
    assert resp.status_code == 200
    names = [r["name"] for r in resp.json()]
    assert names == [
        "Admin",
        "Production Manager",
        "Store Manager",
        "HR Manager",
        "Accountant",
        "Operator",
    ]
    assert client.get("/api/roles").status_code == 200


def test_register_with_operator_role_and_jwt_claims(client):
    data, _email = _register_and_login(client, role="Operator")
    user = data["user"]
    assert user["role"] == "Operator"
    assert user["role_name"] == "Operator"
    assert user["company_id"] == user["tenant_id"]
    assert user["role_id"] is not None
    assert "accounts" not in user["permissions"]
    assert "production" in user["permissions"]

    payload = _jwt_payload(data["access_token"])
    assert payload["user_id"] == user["id"]
    assert payload["company_id"] == user["company_id"]
    assert payload["email"] == user["email"]
    assert payload["full_name"] == user["full_name"]
    assert payload["role"] == "Operator"
    assert payload["role_id"] == user["role_id"]
    assert payload["role_name"] == "Operator"


def test_sidebar_filtered_for_operator(client):
    data, _email = _register_and_login(client, role="Operator")
    headers = {"Authorization": f"Bearer {data['access_token']}"}

    menus = client.get("/sidebar", headers=headers)
    assert menus.status_code == 200
    keys = [m["key"] for m in menus.json()]
    assert "dashboard" in keys
    assert "production" in keys
    assert "finance" not in keys
    assert "settings" not in keys
    assert "admin" not in keys
    assert "masters" not in keys
    if "hr" in keys:
        hr = next(m for m in menus.json() if m["key"] == "hr")
        assert [c["label"] for c in hr["children"]] == ["Attendance"]

    labels = client.get("/sidebar/labels", headers=headers)
    assert labels.status_code == 200
    flat = labels.json()
    assert "Dashboard" in flat
    assert "Work Orders" in flat
    assert "Attendance" in flat

    api_menus = client.get("/api/sidebar", headers=headers)
    assert api_menus.status_code == 200
    assert [m["key"] for m in api_menus.json()] == keys


def test_permissions_catalog_requires_auth(client, register_admin):
    bare = client.get("/permissions")
    assert bare.status_code in (401, 403)

    admin = register_admin()
    resp = client.get("/permissions", headers=admin["headers"])
    assert resp.status_code == 200
    assert len(resp.json()) > 0


def test_profile_endpoints(client, register_admin):
    admin = register_admin()
    for path in ("/auth/me", "/auth/profile", "/profile"):
        resp = client.get(path, headers=admin["headers"])
        assert resp.status_code == 200, path
        body = resp.json()
        assert body["role"] == "Admin"
        assert body["company_id"] is not None
