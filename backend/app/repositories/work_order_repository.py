"""Work order data access."""

from datetime import date, datetime, timezone

from sqlalchemy import func, or_, select

from app.models.production import WorkOrder
from app.models.user import User
from app.repositories.base_repository import BaseRepository
from app.services.data_scope import scope_work_orders


class WorkOrderRepository(BaseRepository):
    def _base_stmt(self, user: User | None = None):
        stmt = select(WorkOrder).where(WorkOrder.tenant_id == self.tenant_id)
        if user is not None:
            stmt = scope_work_orders(stmt, user)
        return stmt

    def list_all(self, user: User | None = None) -> list[WorkOrder]:
        stmt = self._base_stmt(user).order_by(WorkOrder.id.desc())
        return list(self.db.scalars(stmt).all())

    def list_today(self, user: User | None = None) -> list[WorkOrder]:
        today = date.today()
        orders = self.list_all(user=user)
        return [
            wo
            for wo in orders
            if (
                wo.planned_start
                and (
                    wo.planned_start.date() == today
                    if wo.planned_start.tzinfo
                    else wo.planned_start.replace(tzinfo=timezone.utc).date() == today
                )
            )
            or wo.status in ("in_progress", "running", "paused")
        ]

    def list_assigned(self, user: User) -> list[WorkOrder]:
        conditions = [WorkOrder.assigned_user_id == user.id]
        if user.assigned_machine_id:
            conditions.append(WorkOrder.machine_id == user.assigned_machine_id)
        stmt = select(WorkOrder).where(
            WorkOrder.tenant_id == self.tenant_id,
            or_(*conditions),
        )
        stmt = scope_work_orders(stmt, user)
        return list(self.db.scalars(stmt.order_by(WorkOrder.id.desc())).all())

    def list_pending(self, user: User | None = None) -> list[WorkOrder]:
        pending_statuses = ("planned", "pending", "released", "material_ready", "machine_ready")
        stmt = self._base_stmt(user).where(WorkOrder.status.in_(pending_statuses))
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, work_order_id: int) -> WorkOrder | None:
        return self.db.scalars(
            select(WorkOrder).where(
                WorkOrder.id == work_order_id,
                WorkOrder.tenant_id == self.tenant_id,
            )
        ).first()

    def get_by_number(self, number: str, user: User | None = None) -> WorkOrder | None:
        normalized = number.strip().upper()
        stmt = select(WorkOrder).where(
            WorkOrder.tenant_id == self.tenant_id,
            func.upper(WorkOrder.work_order_number) == normalized,
        )
        if user is not None:
            stmt = scope_work_orders(stmt, user)
        return self.db.scalars(stmt).first()

    def save(self, work_order: WorkOrder) -> WorkOrder:
        self.db.commit()
        self.db.refresh(work_order)
        return work_order
