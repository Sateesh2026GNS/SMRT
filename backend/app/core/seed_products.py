"""Seed sample products for tenant 1."""


def seed_products(db, tenant_id: int = 1):
    """Create sample products if none exist for the given tenant."""
    from sqlalchemy import select

    from app.models.product import Product

    # Delete existing products first to reseed with Forma company catalogue
    db.query(Product).filter(Product.tenant_id == tenant_id).delete()

    samples = [
        {
            "sku": "FRM-001",
            "name": "Cold-Rolled Steel Panel",
            "description": "High-strength cold-rolled steel panel, 2mm thickness, used in structural and fabrication applications",
            "unit_cost": 1850.00,
            "unit_price": 2400.00,
        },
        {
            "sku": "FRM-002",
            "name": "Aluminium Extrusion Profile",
            "description": "6063-T5 aluminium extrusion profile, 40x40mm cross-section, anodised finish for frames and enclosures",
            "unit_cost": 3200.00,
            "unit_price": 4100.00,
        },
        {
            "sku": "FRM-003",
            "name": "Industrial Hex Bolt Set (M12)",
            "description": "Grade 8.8 zinc-plated M12 hex bolt and nut set, pack of 100, for heavy-duty assembly",
            "unit_cost": 520.00,
            "unit_price": 750.00,
        },
        {
            "sku": "FRM-004",
            "name": "Epoxy Powder Coating (RAL 9005)",
            "description": "Jet-black thermosetting epoxy-polyester powder coating, 20kg batch, RAL 9005 for metal surface finishing",
            "unit_cost": 2750.00,
            "unit_price": 3500.00,
        },
        {
            "sku": "FRM-005",
            "name": "Double-Acting Hydraulic Cylinder (50mm)",
            "description": "50mm bore double-acting hydraulic cylinder, 300mm stroke, rated at 250 bar, for press and clamping applications",
            "unit_cost": 7800.00,
            "unit_price": 10500.00,
        },
        {
            "sku": "FRM-006",
            "name": "Deep-Groove Ball Bearing (6205-2RS)",
            "description": "6205-2RS sealed deep-groove ball bearing, 25x52x15mm, for motors, gearboxes and rotating equipment",
            "unit_cost": 380.00,
            "unit_price": 560.00,
        },
        {
            "sku": "FRM-007",
            "name": "Polycarbonate Sheet (4mm)",
            "description": "Clear UV-stabilised polycarbonate sheet, 4mm thick, 2440x1220mm, for machine guards and safety enclosures",
            "unit_cost": 2100.00,
            "unit_price": 2900.00,
        },
    ]
    for s in samples:
        p = Product(
            tenant_id=tenant_id,
            sku=s["sku"],
            name=s["name"],
            description=s["description"],
            unit_cost=s.get("unit_cost"),
            unit_price=s.get("unit_price"),
        )
        db.add(p)
    db.commit()
