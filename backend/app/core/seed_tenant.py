"""Ensure default tenant exists."""


def seed_tenant(db):
    """Create or update tenant 1 (GNS)."""
    from sqlalchemy import select

    from app.models.tenant import Tenant

    existing = db.scalars(select(Tenant).where(Tenant.id == 1)).first()
    if existing:
        changed = False
        if existing.name != "GNS":
            name_clash = db.scalars(
                select(Tenant).where(Tenant.name == "GNS", Tenant.id != existing.id)
            ).first()
            if not name_clash:
                existing.name = "GNS"
                changed = True
        if existing.slug != "gns":
            slug_clash = db.scalars(
                select(Tenant).where(Tenant.slug == "gns", Tenant.id != existing.id)
            ).first()
            if not slug_clash:
                existing.slug = "gns"
                changed = True
        if changed:
            db.commit()
        return

    tenant = Tenant(id=1, name="GNS", slug="gns")
    db.add(tenant)
    db.commit()
