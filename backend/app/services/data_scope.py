"""Row-level data filtering based on user role and assignment."""

from sqlalchemy import Select, or_

from app.core.permissions import get_role_names, user_is_admin
from app.models.production import DailyProductionReport, WorkOrder
from app.models.user import User


def _roles(user: User) -> set[str]:
    return set(get_role_names(user))


def scope_work_orders(stmt: Select, user: User) -> Select:
    if user_is_admin(user):
        return stmt
    roles = _roles(user)
    if "Operator" in roles:
        conditions = [WorkOrder.assigned_user_id == user.id]
        if user.assigned_machine_id:
            conditions.append(WorkOrder.machine_id == user.assigned_machine_id)
        return stmt.where(or_(*conditions))
    if "Production Manager" in roles and user.plant_code:
        return stmt.where(WorkOrder.plant_code == user.plant_code)
    return stmt


def scope_daily_reports(stmt: Select, user: User) -> Select:
    if user_is_admin(user):
        return stmt
    roles = _roles(user)
    if "Operator" in roles:
        stmt = stmt.where(DailyProductionReport.created_by_user_id == user.id)
        if user.assigned_machine_id:
            stmt = stmt.where(
                or_(
                    DailyProductionReport.machine_id == user.assigned_machine_id,
                    DailyProductionReport.machine_id.is_(None),
                )
            )
        return stmt
    if "Production Manager" in roles and user.plant_code:
        return stmt.join(
            WorkOrder,
            DailyProductionReport.work_order_id == WorkOrder.id,
            isouter=True,
        ).where(
            or_(
                WorkOrder.plant_code == user.plant_code,
                DailyProductionReport.work_order_id.is_(None),
            )
        )
    return stmt


def operator_can_access_work_order(user: User, work_order: WorkOrder) -> bool:
    if user_is_admin(user):
        return True
    if "Operator" not in _roles(user):
        return True
    if work_order.assigned_user_id == user.id:
        return True
    if user.assigned_machine_id and work_order.machine_id == user.assigned_machine_id:
        return True
    return False


def production_manager_plant(user: User) -> str | None:
    if user_is_admin(user):
        return None
    if "Production Manager" in _roles(user):
        return user.plant_code
    return None
