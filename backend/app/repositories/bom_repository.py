"""BOM data access."""

from sqlalchemy import select

from app.models.bom import BillOfMaterial
from app.models.product import Product
from app.repositories.base_repository import BaseRepository


class BomRepository(BaseRepository):
    def list_all(self) -> list[BillOfMaterial]:
        return list(
            self.db.scalars(
                select(BillOfMaterial)
                .where(BillOfMaterial.tenant_id == self.tenant_id)
                .order_by(BillOfMaterial.id)
            ).all()
        )

    def get_by_id(self, bom_id: int) -> BillOfMaterial | None:
        return self.db.scalars(
            select(BillOfMaterial).where(
                BillOfMaterial.id == bom_id,
                BillOfMaterial.tenant_id == self.tenant_id,
            )
        ).first()

    def list_by_product(self, product_id: int) -> list[BillOfMaterial]:
        return list(
            self.db.scalars(
                select(BillOfMaterial).where(
                    BillOfMaterial.tenant_id == self.tenant_id,
                    BillOfMaterial.product_id == product_id,
                )
            ).all()
        )

    def enrich_item(self, item: BillOfMaterial) -> dict:
        product = self.db.get(Product, item.product_id)
        component = self.db.get(Product, item.component_product_id)
        product_name = product.name if product else None
        product_sku = product.sku if product else None
        component_name = component.name if component else None
        component_sku = component.sku if component else None
        qty = float(item.quantity)
        unit_cost = float(component.unit_cost or 0) if component else 0.0
        return {
            "id": item.id,
            "product_id": item.product_id,
            "product_name": product_name,
            "product": product_name,
            "product_sku": product_sku,
            "component_product_id": item.component_product_id,
            "component_name": component_name,
            "component": component_name,
            "component_sku": component_sku,
            "quantity": qty,
            "unit": item.unit,
            "unit_cost": unit_cost,
            "total_cost": round(qty * unit_cost, 2),
        }
