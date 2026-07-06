"""Production order completion should increase finished-goods inventory stock."""
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.inventory import InventoryItem, StockLevel


def _create_product(client, headers, sku="FG-TEST", name="Finished Widget"):
    return client.post(
        "/production/products/manage",
        headers=headers,
        json={
            "tenant_id": 0,
            "sku": sku,
            "name": name,
            "unit_cost": 10.0,
            "unit_price": 25.0,
        },
    )


def _create_warehouse(client, headers, code="WH-TEST"):
    return client.post(
        "/inventory/warehouses",
        headers=headers,
        json={
            "tenant_id": 0,
            "name": "Main Warehouse",
            "code": code,
            "is_primary": True,
        },
    )


def test_production_completion_increases_finished_goods_stock(client, register_admin):
    admin = register_admin()
    headers = admin["headers"]
    tenant_id = admin["user"]["tenant_id"]

    wh = _create_warehouse(client, headers, code=f"WH-{tenant_id}")
    assert wh.status_code == 200, wh.text
    warehouse_id = wh.json()["id"]

    prod = _create_product(client, headers, sku=f"FG-{tenant_id}")
    assert prod.status_code == 200, prod.text
    product_id = prod.json()["id"]
    sku = prod.json()["sku"]

    order = client.post(
        "/production/orders",
        headers=headers,
        json={
            "tenant_id": tenant_id,
            "product_id": product_id,
            "order_number": f"PO-STOCK-{tenant_id}",
            "planned_quantity": 50,
            "status": "in_progress",
        },
    )
    assert order.status_code == 200, order.text
    order_id = order.json()["id"]

    # Stock before completion
    db = SessionLocal()
    try:
        item = db.scalars(
            select(InventoryItem).where(
                InventoryItem.tenant_id == tenant_id,
                InventoryItem.sku == sku,
            )
        ).first()
        stock_before = 0
        if item:
            sl = db.scalars(
                select(StockLevel).where(
                    StockLevel.warehouse_id == warehouse_id,
                    StockLevel.item_id == item.id,
                )
            ).first()
            stock_before = sl.quantity if sl else 0
    finally:
        db.close()

    completed = client.patch(
        f"/production/orders/{order_id}/status",
        headers=headers,
        params={"status": "completed"},
    )
    assert completed.status_code == 200, completed.text
    assert completed.json()["status"] == "completed"

    db = SessionLocal()
    try:
        item = db.scalars(
            select(InventoryItem).where(
                InventoryItem.tenant_id == tenant_id,
                InventoryItem.sku == sku,
                InventoryItem.item_type == "finished_good",
            )
        ).first()
        assert item is not None
        sl = db.scalars(
            select(StockLevel).where(
                StockLevel.warehouse_id == warehouse_id,
                StockLevel.item_id == item.id,
            )
        ).first()
        assert sl is not None
        assert sl.quantity == stock_before + 50
    finally:
        db.close()
