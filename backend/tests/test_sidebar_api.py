"""Tests for sidebar-aligned /api/erp, /api/masters, /api/production routes."""


def test_erp_dashboard(register_admin, client):
    admin = register_admin()
    login = client.post("/api/auth/login", json={"email": admin["email"], "password": admin["password"], "role": "Admin"})
    headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}
    resp = client.get("/api/erp/dashboard", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "kpi_cards" in body["data"]


def test_masters_products(register_admin, client):
    admin = register_admin()
    login = client.post("/api/auth/login", json={"email": admin["email"], "password": admin["password"], "role": "Admin"})
    headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}
    resp = client.get("/api/masters/products", headers=headers)
    assert resp.status_code == 200


def test_production_hub(register_admin, client):
    admin = register_admin()
    login = client.post("/api/auth/login", json={"email": admin["email"], "password": admin["password"], "role": "Admin"})
    headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}
    resp = client.get("/api/production/hub", headers=headers)
    assert resp.status_code == 200


def test_production_planning(register_admin, client):
    admin = register_admin()
    login = client.post("/api/auth/login", json={"email": admin["email"], "password": admin["password"], "role": "Admin"})
    headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}
    resp = client.get("/api/production/planning", headers=headers)
    assert resp.status_code == 200


def test_production_work_orders(register_admin, client):
    admin = register_admin()
    login = client.post("/api/auth/login", json={"email": admin["email"], "password": admin["password"], "role": "Admin"})
    headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}
    resp = client.get("/api/production/work-orders", headers=headers)
    assert resp.status_code == 200
