from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, aliased

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.models.bom import BillOfMaterial
from app.models.product import Product

router = APIRouter(prefix="/products", tags=["Product Management"])

MODULE = "production"


@router.get("/catalog")
def get_product_catalog(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """All finished/sellable products for the tenant."""
    products = list(
        db.scalars(
            select(Product).where(Product.tenant_id == tenant_id).order_by(Product.name)
        ).all()
    )
    return [
        {
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "description": p.description,
            "unit_cost": float(p.unit_cost) if p.unit_cost is not None else None,
            "unit_price": float(p.unit_price) if p.unit_price is not None else None,
        }
        for p in products
    ]


@router.get("/categories")
def get_product_categories(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Categories derived from the SKU prefix (text before the first '-')."""
    products = list(
        db.scalars(select(Product).where(Product.tenant_id == tenant_id)).all()
    )
    buckets: dict[str, int] = {}
    for p in products:
        prefix = (p.sku or "").split("-")[0].upper() or "UNCATEGORISED"
        buckets[prefix] = buckets.get(prefix, 0) + 1
    return [
        {"category": code, "product_count": count}
        for code, count in sorted(buckets.items())
    ]


@router.get("/bom")
def get_bill_of_materials(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """All bill-of-material lines with parent product and component names."""
    Parent = aliased(Product)
    Component = aliased(Product)
    rows = db.execute(
        select(
            BillOfMaterial.id,
            Parent.name,
            Parent.sku,
            Component.name,
            Component.sku,
            BillOfMaterial.quantity,
            BillOfMaterial.unit,
        )
        .join(Parent, BillOfMaterial.product_id == Parent.id)
        .join(Component, BillOfMaterial.component_product_id == Component.id)
        .where(BillOfMaterial.tenant_id == tenant_id)
        .order_by(Parent.name)
    ).all()
    return [
        {
            "id": r[0],
            "product": r[1],
            "product_sku": r[2],
            "component": r[3],
            "component_sku": r[4],
            "quantity": float(r[5] or 0),
            "unit": r[6],
        }
        for r in rows
    ]


@router.get("/costing")
def get_product_costing(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Per-product margin using stored unit cost vs unit price."""
    products = list(
        db.scalars(select(Product).where(Product.tenant_id == tenant_id)).all()
    )
    result = []
    for p in products:
        cost = float(p.unit_cost) if p.unit_cost is not None else None
        price = float(p.unit_price) if p.unit_price is not None else None
        margin = (price - cost) if (cost is not None and price is not None) else None
        margin_pct = (
            round(margin / price * 100, 1)
            if (margin is not None and price)
            else None
        )
        result.append(
            {
                "id": p.id,
                "sku": p.sku,
                "product": p.name,
                "unit_cost": cost,
                "unit_price": price,
                "margin": margin,
                "margin_pct": margin_pct,
            }
        )
    return result
