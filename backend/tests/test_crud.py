def _create_product(client, headers, sku="CRUD-1", name="Gadget"):
    return client.post(
        "/production/products/manage",
        headers=headers,
        json={
            "tenant_id": 0,
            "sku": sku,
            "name": name,
            "unit_cost": 5.0,
            "unit_price": 12.5,
        },
    )


def test_product_crud_happy_path(client, register_admin):
    admin = register_admin()
    headers = admin["headers"]

    created = _create_product(client, headers, sku="CRUD-A")
    assert created.status_code == 200, created.text
    pid = created.json()["id"]

    got = client.get(f"/production/products/{pid}", headers=headers)
    assert got.status_code == 200
    assert got.json()["sku"] == "CRUD-A"

    updated = client.patch(
        f"/production/products/{pid}",
        headers=headers,
        json={"name": "Renamed Gadget"},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Renamed Gadget"

    deleted = client.delete(f"/production/products/{pid}", headers=headers)
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] is True

    gone = client.get(f"/production/products/{pid}", headers=headers)
    assert gone.status_code == 404


def test_update_missing_product_returns_404(client, register_admin):
    admin = register_admin()
    resp = client.patch(
        "/production/products/999999",
        headers=admin["headers"],
        json={"name": "Nope"},
    )
    assert resp.status_code == 404


def test_delete_missing_product_returns_404(client, register_admin):
    admin = register_admin()
    resp = client.delete("/production/products/999999", headers=admin["headers"])
    assert resp.status_code == 404


def test_company_settings_persist(client, register_admin):
    admin = register_admin()
    headers = admin["headers"]

    initial = client.get("/settings/company", headers=headers)
    assert initial.status_code == 200

    updated = client.put(
        "/settings/company",
        headers=headers,
        json={"company_name": "Acme Mfg", "default_gst_pct": 18.0, "invoice_prefix": "ACM-"},
    )
    assert updated.status_code == 200
    body = updated.json()
    assert body["company_name"] == "Acme Mfg"
    assert float(body["default_gst_pct"]) == 18.0

    refetch = client.get("/settings/company", headers=headers)
    assert refetch.json()["invoice_prefix"] == "ACM-"
