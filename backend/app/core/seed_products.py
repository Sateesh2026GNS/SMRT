"""Seed sample products for tenant 1."""


def seed_products(db, tenant_id: int = 1):
    """Create sample products if none exist for the given tenant."""
    from sqlalchemy import select

    from app.models.product import Product

    stmt = select(Product).where(Product.tenant_id == tenant_id)
    existing = list(db.scalars(stmt).all())
    if existing:
        return

    samples = [
        {"sku": "WIDGET-001", "name": "Widget A", "description": "Standard widget"},
        {"sku": "WIDGET-002", "name": "Widget B", "description": "Premium widget"},
        {"sku": "PART-101", "name": "Component X", "description": "Raw component"},
    ]
    for s in samples:
        p = Product(
            tenant_id=tenant_id, sku=s["sku"], name=s["name"], description=s["description"]
        )
        db.add(p)
    db.commit()
