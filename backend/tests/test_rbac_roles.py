"""RBAC tests for the six default enterprise roles and operator data isolation."""

import pytest
from sqlalchemy import select

from app.core.seed_roles import seed_roles
from app.core.seed_users import seed_admin_user
from app.models.production import WorkOrder
from app.models.user import User
from app.core.database import SessionLocal


@pytest.fixture(scope="session", autouse=True)
def seed_demo_data():
    """Seed tenant 1 demo roles and users once per test session."""
    from app.core.seed_tenant import seed_tenant

    db = SessionLocal()
    try:
        seed_tenant(db)
        seed_roles(db)
        seed_admin_user(db)
    finally:
        db.close()


def _login(client, email, password):
    resp = client.post("/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.parametrize(
    "email,password,allowed_paths,denied_paths",
    [
        (
            "admin@smrt.local",
            "admin123",
            ["/production/work-orders", "/inventory/items", "/hr/employees", "/accounts/dashboard"],
            [],
        ),
        (
            "production@smrt.local",
            "demo123",
            ["/production/work-orders", "/quality/inspection"],
            ["/hr/employees", "/accounts/dashboard", "/admin/users"],
        ),
        (
            "store@smrt.local",
            "demo123",
            ["/inventory/items", "/procurement/purchase-orders"],
            ["/production/work-orders", "/hr/employees", "/accounts/dashboard"],
        ),
        (
            "hr@smrt.local",
            "demo123",
            ["/hr/employees"],
            ["/production/work-orders", "/inventory/items", "/accounts/dashboard"],
        ),
        (
            "accounts@smrt.local",
            "demo123",
            ["/accounts/dashboard", "/sales/customers"],
            ["/production/work-orders", "/hr/employees", "/admin/users"],
        ),
        (
            "operator@smrt.local",
            "demo123",
            ["/production/work-orders", "/production/machines"],
            ["/analytics/dashboard", "/hr/employees", "/admin/users"],
        ),
    ],
)
def test_role_route_access(client, email, password, allowed_paths, denied_paths):
    headers = _login(client, email, password)
    for path in allowed_paths:
        resp = client.get(path, headers=headers)
        assert resp.status_code == 200, f"{email} should access {path}, got {resp.status_code}"
    for path in denied_paths:
        resp = client.get(path, headers=headers)
        assert resp.status_code == 403, f"{email} should be denied {path}, got {resp.status_code}"


def test_operator_cannot_create_work_order(client):
    headers = _login(client, "operator@smrt.local", "demo123")
    resp = client.post(
        "/production/work-orders",
        headers=headers,
        json={
            "tenant_id": 1,
            "production_order_id": 1,
            "work_order_number": "WO-HACK",
            "planned_quantity": 10,
        },
    )
    assert resp.status_code == 403


def test_operator_sees_only_assigned_work_orders(client):
    headers = _login(client, "operator@smrt.local", "demo123")
    resp = client.get("/production/work-orders", headers=headers)
    assert resp.status_code == 200
    orders = resp.json()
    assert len(orders) >= 1
    for wo in orders:
        assert wo["work_order_number"] == "WO-OPERATOR-001" or wo.get("assigned_user_id") is not None


def test_operator_cannot_delete_product(client):
    headers = _login(client, "operator@smrt.local", "demo123")
    resp = client.delete("/production/products/1", headers=headers)
    assert resp.status_code == 403


def test_hr_manager_denied_production_write(client):
    headers = _login(client, "hr@smrt.local", "demo123")
    resp = client.post(
        "/production/work-orders",
        headers=headers,
        json={
            "tenant_id": 1,
            "production_order_id": 1,
            "work_order_number": "WO-HR",
            "planned_quantity": 5,
        },
    )
    assert resp.status_code == 403


def test_permission_matrix_endpoint(client):
    headers = _login(client, "admin@smrt.local", "admin123")
    resp = client.get("/admin/permissions/matrix", headers=headers)
    assert resp.status_code == 200
    matrix = resp.json()
    assert "Operator" in matrix
    assert "production:read" in matrix["Operator"].get("actions", [])
