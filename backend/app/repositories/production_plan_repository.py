"""Production plan (production orders) data access."""

from datetime import date, datetime, timezone

from sqlalchemy import select

from app.models.production import ProductionOrder
from app.repositories.base_repository import BaseRepository


class ProductionPlanRepository(BaseRepository):
    def list_all(self) -> list[ProductionOrder]:
        return list(
            self.db.scalars(
                select(ProductionOrder)
                .where(ProductionOrder.tenant_id == self.tenant_id)
                .order_by(ProductionOrder.id.desc())
            ).all()
        )

    def get_by_id(self, plan_id: int) -> ProductionOrder | None:
        return self.db.scalars(
            select(ProductionOrder).where(
                ProductionOrder.id == plan_id,
                ProductionOrder.tenant_id == self.tenant_id,
            )
        ).first()

    def list_today(self) -> list[ProductionOrder]:
        today = date.today()
        orders = self.list_all()
        result = []
        for order in orders:
            if order.start_date:
                start = order.start_date
                if start.tzinfo is None:
                    start = start.replace(tzinfo=timezone.utc)
                if start.date() == today:
                    result.append(order)
                    continue
            if order.status in ("in_progress", "running", "planned"):
                result.append(order)
        return result[:20] if result else orders[:10]
