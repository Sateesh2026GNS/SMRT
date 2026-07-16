def test_restricted_user_allowed_own_module(client, register_admin, make_restricted_user):
    admin = register_admin()
    tenant_id = admin["user"]["tenant_id"]
    limited = make_restricted_user(tenant_id, permissions=["production"])

    resp = client.get("/api/masters/products", headers=limited["headers"])
    assert resp.status_code == 200


def test_restricted_user_denied_other_module(client, register_admin, make_restricted_user):
    admin = register_admin()
    tenant_id = admin["user"]["tenant_id"]
    limited = make_restricted_user(tenant_id, permissions=["dashboard"])

    resp = client.get("/api/masters/products", headers=limited["headers"])
    assert resp.status_code == 403


def test_admin_can_access_production_module(client, register_admin):
    admin = register_admin()
    for path in ("/api/masters/products", "/api/production/work-orders"):
        resp = client.get(path, headers=admin["headers"])
        assert resp.status_code == 200, f"{path} -> {resp.status_code}"


def test_unauthenticated_denied(client):
    resp = client.get("/api/masters/products")
    assert resp.status_code == 401
