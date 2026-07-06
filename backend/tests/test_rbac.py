def test_restricted_user_allowed_own_module(client, register_admin, make_restricted_user):
    admin = register_admin()
    tenant_id = admin["user"]["tenant_id"]
    limited = make_restricted_user(tenant_id, permissions=["sales"])

    # Has 'sales' permission -> allowed.
    resp = client.get("/sales/customers", headers=limited["headers"])
    assert resp.status_code == 200


def test_restricted_user_denied_other_module(client, register_admin, make_restricted_user):
    admin = register_admin()
    tenant_id = admin["user"]["tenant_id"]
    limited = make_restricted_user(tenant_id, permissions=["sales"])

    # No 'production' permission -> forbidden.
    resp = client.get("/production/products", headers=limited["headers"])
    assert resp.status_code == 403


def test_admin_can_access_any_module(client, register_admin):
    admin = register_admin()
    for path in ("/production/products", "/sales/customers", "/inventory/items"):
        resp = client.get(path, headers=admin["headers"])
        assert resp.status_code == 200, f"{path} -> {resp.status_code}"


def test_unauthenticated_denied(client):
    resp = client.get("/production/products")
    assert resp.status_code == 401
