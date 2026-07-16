def _create_product(client, headers, sku="CRUD-1", name="Gadget"):
    return client.post(
        "/api/masters/products",
        headers=headers,
        json={
            "tenant_id": 0,
            "sku": sku,
            "name": name,
            "unit_cost": 5.0,
            "unit_price": 12.5,
        },
    )


def _unwrap(data):
    if isinstance(data, dict) and "success" in data and "data" in data:
        return data["data"]
    return data


def test_product_crud_happy_path(client, register_admin):
    admin = register_admin()
    headers = admin["headers"]

    created = _create_product(client, headers, sku="CRUD-A")
    assert created.status_code == 200, created.text
    pid = _unwrap(created.json())["id"]

    got = client.get(f"/api/masters/products/{pid}", headers=headers)
    assert got.status_code == 200
    assert _unwrap(got.json())["sku"] == "CRUD-A"

    updated = client.put(
        f"/api/masters/products/{pid}",
        headers=headers,
        json={"name": "Renamed Gadget"},
    )
    assert updated.status_code == 200
    assert _unwrap(updated.json())["name"] == "Renamed Gadget"

    deleted = client.delete(f"/api/masters/products/{pid}", headers=headers)
    assert deleted.status_code == 200
    assert _unwrap(deleted.json())["id"] == pid

    gone = client.get(f"/api/masters/products/{pid}", headers=headers)
    assert gone.status_code == 404


def test_update_missing_product_returns_404(client, register_admin):
    admin = register_admin()
    resp = client.put(
        "/api/masters/products/999999",
        headers=admin["headers"],
        json={"name": "Nope"},
    )
    assert resp.status_code == 404


def test_delete_missing_product_returns_404(client, register_admin):
    admin = register_admin()
    resp = client.delete("/api/masters/products/999999", headers=admin["headers"])
    assert resp.status_code == 404
