def _create_product(client, headers, sku, name="Widget"):
    return client.post(
        "/api/masters/products",
        headers=headers,
        json={
            "tenant_id": 0,
            "sku": sku,
            "name": name,
            "unit_cost": 10.0,
            "unit_price": 25.0,
        },
    )


def _unwrap_list(data):
    if isinstance(data, dict) and "success" in data and "data" in data:
        return data["data"]
    return data


def test_product_not_visible_across_tenants(client, register_admin):
    tenant_a = register_admin()
    tenant_b = register_admin()

    resp = _create_product(client, tenant_a["headers"], sku="A-SKU-1", name="Alpha")
    assert resp.status_code == 200, resp.text
    created = _unwrap_list(resp.json())
    product_id = created["id"]

    list_a = client.get("/api/masters/products", headers=tenant_a["headers"])
    assert list_a.status_code == 200
    products_a = _unwrap_list(list_a.json())
    assert any(p["id"] == product_id for p in products_a)

    list_b = client.get("/api/masters/products", headers=tenant_b["headers"])
    assert list_b.status_code == 200
    products_b = _unwrap_list(list_b.json())
    assert all(p["id"] != product_id for p in products_b)

    detail_b = client.get(
        f"/api/masters/products/{product_id}", headers=tenant_b["headers"]
    )
    assert detail_b.status_code == 404
