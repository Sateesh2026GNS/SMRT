def _create_product(client, headers, sku, name="Widget"):
    return client.post(
        "/production/products/manage",
        headers=headers,
        json={
            "tenant_id": 0,  # should be overridden server-side
            "sku": sku,
            "name": name,
            "unit_cost": 10.0,
            "unit_price": 25.0,
        },
    )


def test_product_not_visible_across_tenants(client, register_admin):
    tenant_a = register_admin()
    tenant_b = register_admin()

    resp = _create_product(client, tenant_a["headers"], sku="A-SKU-1", name="Alpha")
    assert resp.status_code == 200, resp.text
    product_id = resp.json()["id"]
    assert resp.json()["tenant_id"] == tenant_a["user"]["tenant_id"]

    # Tenant A sees its product.
    list_a = client.get("/production/products", headers=tenant_a["headers"])
    assert list_a.status_code == 200
    assert any(p["id"] == product_id for p in list_a.json())

    # Tenant B does not.
    list_b = client.get("/production/products", headers=tenant_b["headers"])
    assert list_b.status_code == 200
    assert all(p["id"] != product_id for p in list_b.json())

    # Tenant B cannot fetch it by id.
    detail_b = client.get(
        f"/production/products/{product_id}", headers=tenant_b["headers"]
    )
    assert detail_b.status_code == 404
