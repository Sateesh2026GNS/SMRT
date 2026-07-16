"""Operator module business logic — orchestrates repositories and existing services."""

from __future__ import annotations

import logging
from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import get_role_names, user_is_admin
from app.models.production import Batch, DailyProductionReport, WorkOrder
from app.models.user import User
from app.repositories.batch_repository import BatchRepository
from app.repositories.bom_repository import BomRepository
from app.repositories.machine_repository import MachineRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.production_plan_repository import ProductionPlanRepository
from app.repositories.work_order_repository import WorkOrderRepository
from app.schemas.operator import (
    BatchUpdateRequest,
    MachineBreakdownRequest,
    OperatorProfileRead,
    ShopFloorUpdateRequest,
    WorkOrderActionRequest,
    WorkOrderProgressRequest,
)
from app.services.allocation_service import get_allocation_list, get_allocation_summary
from app.services.batch_tracking_service import get_batch_detail, get_batch_summary, list_batches_enriched
from app.services.data_scope import operator_can_access_work_order
from app.services.notification_management_service import (
    NotificationManagementService,
    clear_all_notifications,
    get_user_notifications,
    mark_notifications_read,
)
from app.services.production_planning_service import get_production_order_detail, list_production_orders_enriched
from app.services.schedule_service import get_enhanced_timeline, get_schedule_dashboard
from app.services.shop_floor_service import (
    get_shop_floor_alerts,
    get_shop_floor_grid,
    get_shop_floor_summary,
    get_shop_floor_timeline,
)
from app.services.work_order_service import (
    complete_work_order,
    get_work_order_detail,
    list_work_orders_enriched,
    pause_work_order,
    start_work_order,
)

logger = logging.getLogger(__name__)

RUNNING_STATUSES = ("in_progress", "running")
COMPLETED_STATUSES = ("completed", "closed", "done")


def _serialize_model(obj) -> dict | list | None:
    if obj is None:
        return None
    if isinstance(obj, list):
        return [_serialize_model(x) for x in obj]
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    if hasattr(obj, "__dict__"):
        return {k: _serialize_model(v) for k, v in obj.__dict__.items() if not k.startswith("_")}
    return obj


def _resolve_work_order(
    repo: WorkOrderRepository,
    user: User,
    work_order_id: int | None,
    work_order_number: str | None,
) -> WorkOrder:
    wo = None
    if work_order_id:
        wo = repo.get_by_id(work_order_id)
    elif work_order_number:
        wo = repo.get_by_number(work_order_number, user=user)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    if not operator_can_access_work_order(user, wo):
        raise HTTPException(status_code=403, detail="You are not assigned to this work order")
    return wo


class OperatorService:
    def __init__(self, db: Session, tenant_id: int):
        self.db = db
        self.tenant_id = tenant_id
        self.work_orders = WorkOrderRepository(db, tenant_id)
        self.machines = MachineRepository(db, tenant_id)
        self.products = ProductRepository(db, tenant_id)
        self.bom = BomRepository(db, tenant_id)
        self.batches = BatchRepository(db, tenant_id)
        self.plans = ProductionPlanRepository(db, tenant_id)

    # ── Dashboard ──────────────────────────────────────────────────────────

    def get_dashboard(self, user: User) -> dict:
        summary = get_shop_floor_summary(self.db, self.tenant_id)
        wo_summary = list_work_orders_enriched(self.db, self.tenant_id, user=user)
        return {
            "shop_floor": _serialize_model(summary),
            "work_orders_count": len(wo_summary),
            "running_machines": len(self.machines.list_by_status("running", "active")),
            "role": get_role_names(user),
        }

    def get_operator_dashboard(self, user: User) -> dict:
        assigned = self.work_orders.list_assigned(user)
        today = self.work_orders.list_today(user)
        return {
            "assigned_work_orders": len(assigned),
            "today_work_orders": len(today),
            "assigned": [_serialize_model(get_work_order_detail(self.db, self.tenant_id, w.id, user=user)) for w in assigned[:5]],
            "today": [_serialize_model(get_work_order_detail(self.db, self.tenant_id, w.id, user=user)) for w in today[:5]],
        }

    def get_dashboard_summary(self, user: User) -> dict:
        schedule = get_schedule_dashboard(self.db, self.tenant_id)
        batch_sum = get_batch_summary(self.db, self.tenant_id)
        return {
            "schedule": _serialize_model(schedule),
            "batches": _serialize_model(batch_sum),
            "notifications": get_user_notifications(self.db, user).get("count", 0),
        }

    def get_dashboard_today(self, user: User) -> dict:
        today_wos = self.work_orders.list_today(user)
        plans = self.plans.list_today()
        return {
            "work_orders": [_serialize_model(w) for w in list_work_orders_enriched(self.db, self.tenant_id, user=user) if w.id in {x.id for x in today_wos}],
            "production_plans": [
                {
                    "id": p.id,
                    "order_number": p.order_number,
                    "status": p.status,
                    "planned_quantity": float(p.planned_quantity),
                }
                for p in plans
            ],
            "date": date.today().isoformat(),
        }

    # ── Products ───────────────────────────────────────────────────────────

    def list_products(self) -> list[dict]:
        return [
            {
                "id": p.id,
                "sku": p.sku,
                "name": p.name,
                "description": p.description,
                "unit_cost": float(p.unit_cost) if p.unit_cost else None,
                "unit_price": float(p.unit_price) if p.unit_price else None,
            }
            for p in self.products.list_all()
        ]

    def get_product(self, product_id: int) -> dict:
        p = self.products.get_by_id(product_id)
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        return {
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "description": p.description,
            "unit_cost": float(p.unit_cost) if p.unit_cost else None,
            "unit_price": float(p.unit_price) if p.unit_price else None,
            "bom_items": [self.bom.enrich_item(b) for b in self.bom.list_by_product(p.id)],
        }

    def search_products(self, query: str) -> list[dict]:
        return [
            {"id": p.id, "sku": p.sku, "name": p.name}
            for p in self.products.search(query)
        ]

    # ── BOM ────────────────────────────────────────────────────────────────

    def list_bom(self) -> list[dict]:
        return [self.bom.enrich_item(item) for item in self.bom.list_all()]

    def get_bom(self, bom_id: int) -> dict:
        item = self.bom.get_by_id(bom_id)
        if not item:
            raise HTTPException(status_code=404, detail="BOM item not found")
        return self.bom.enrich_item(item)

    def get_bom_for_product(self, product_id: int) -> list[dict]:
        return [self.bom.enrich_item(item) for item in self.bom.list_by_product(product_id)]

    # ── Machines ───────────────────────────────────────────────────────────

    def list_machines(self) -> list[dict]:
        return [
            {
                "id": m.id,
                "code": m.code,
                "name": m.name,
                "status": m.status,
                "is_active": m.is_active,
                "location": getattr(m, "location", None),
            }
            for m in self.machines.list_all()
        ]

    def get_machine(self, machine_id: int) -> dict:
        m = self.machines.get_by_id(machine_id)
        if not m:
            raise HTTPException(status_code=404, detail="Machine not found")
        return {
            "id": m.id,
            "code": m.code,
            "name": m.name,
            "status": m.status,
            "is_active": m.is_active,
            "location": getattr(m, "location", None),
            "capacity": getattr(m, "capacity", None),
        }

    def get_machine_status_summary(self) -> dict:
        machines = self.machines.list_all()
        counts: dict[str, int] = {}
        for m in machines:
            counts[m.status] = counts.get(m.status, 0) + 1
        return {"total": len(machines), "by_status": counts, "machines": self.list_machines()}

    def list_running_machines(self) -> list[dict]:
        return [
            {"id": m.id, "code": m.code, "name": m.name, "status": m.status}
            for m in self.machines.list_by_status("running", "active")
        ]

    def list_idle_machines(self) -> list[dict]:
        return [
            {"id": m.id, "code": m.code, "name": m.name, "status": m.status}
            for m in self.machines.list_by_status("idle", "available")
        ]

    def list_breakdown_machines(self) -> list[dict]:
        return [
            {"id": m.id, "code": m.code, "name": m.name, "status": m.status}
            for m in self.machines.list_by_status("breakdown", "maintenance", "down")
        ]

    # ── Production Plans ───────────────────────────────────────────────────

    def list_production_plans(self) -> list[dict]:
        return _serialize_model(list_production_orders_enriched(self.db, self.tenant_id)) or []

    def list_today_plans(self) -> list[dict]:
        return [
            {
                "id": p.id,
                "order_number": p.order_number,
                "status": p.status,
                "planned_quantity": float(p.planned_quantity),
                "start_date": p.start_date.isoformat() if p.start_date else None,
            }
            for p in self.plans.list_today()
        ]

    def get_production_plan(self, plan_id: int) -> dict:
        detail = get_production_order_detail(self.db, self.tenant_id, plan_id)
        if not detail:
            raise HTTPException(status_code=404, detail="Production plan not found")
        return _serialize_model(detail)

    # ── Work Orders ────────────────────────────────────────────────────────

    def list_work_orders(self, user: User) -> list[dict]:
        return _serialize_model(list_work_orders_enriched(self.db, self.tenant_id, user=user)) or []

    def list_today_work_orders(self, user: User) -> list[dict]:
        today_ids = {w.id for w in self.work_orders.list_today(user)}
        all_wos = list_work_orders_enriched(self.db, self.tenant_id, user=user)
        return _serialize_model([w for w in all_wos if w.id in today_ids]) or []

    def list_assigned_work_orders(self, user: User) -> list[dict]:
        assigned_ids = {w.id for w in self.work_orders.list_assigned(user)}
        all_wos = list_work_orders_enriched(self.db, self.tenant_id, user=user)
        return _serialize_model([w for w in all_wos if w.id in assigned_ids]) or []

    def get_work_order(self, work_order_id: int, user: User) -> dict:
        detail = get_work_order_detail(self.db, self.tenant_id, work_order_id, user=user)
        if not detail:
            raise HTTPException(status_code=404, detail="Work order not found or access denied")
        return _serialize_model(detail)

    def start_work_order(self, user: User, payload: WorkOrderActionRequest) -> dict:
        wo = _resolve_work_order(self.work_orders, user, payload.work_order_id, payload.work_order_number)
        result = start_work_order(self.db, self.tenant_id, wo.id)
        return _serialize_model(result)

    def pause_work_order(self, user: User, payload: WorkOrderActionRequest) -> dict:
        wo = _resolve_work_order(self.work_orders, user, payload.work_order_id, payload.work_order_number)
        result = pause_work_order(self.db, self.tenant_id, wo.id)
        return _serialize_model(result)

    def resume_work_order(self, user: User, payload: WorkOrderActionRequest) -> dict:
        wo = _resolve_work_order(self.work_orders, user, payload.work_order_id, payload.work_order_number)
        if wo.status == "paused":
            wo.status = "running"
            self.work_orders.save(wo)
        return {"success": True, "work_order_id": wo.id, "status": wo.status, "message": "Work order resumed"}

    def complete_work_order(self, user: User, payload: WorkOrderActionRequest) -> dict:
        wo = _resolve_work_order(self.work_orders, user, payload.work_order_id, payload.work_order_number)
        result = complete_work_order(self.db, self.tenant_id, wo.id)
        return _serialize_model(result)

    def update_production_progress(self, user: User, payload: WorkOrderProgressRequest) -> dict:
        wo = _resolve_work_order(self.work_orders, user, payload.work_order_id, payload.work_order_number)
        from app.models.production import ProductionOrder

        po = self.db.get(ProductionOrder, wo.production_order_id)
        product_id = po.product_id if po else 1
        report = DailyProductionReport(
            tenant_id=self.tenant_id,
            report_date=date.today(),
            product_id=product_id,
            work_order_id=wo.id,
            machine_id=wo.machine_id,
            produced_quantity=payload.produced_quantity,
            scrap_quantity=payload.scrap_quantity,
            notes=payload.notes,
            created_by_user_id=user.id,
        )
        self.db.add(report)
        wo.actual_quantity = float(wo.actual_quantity or 0) + payload.produced_quantity
        self.db.commit()
        self.db.refresh(report)
        return {
            "work_order_id": wo.id,
            "produced_quantity": float(wo.actual_quantity),
            "report_id": report.id,
        }

    # ── Schedule ─────────────────────────────────────────────────────────

    def get_schedule(self) -> dict:
        return _serialize_model(get_schedule_dashboard(self.db, self.tenant_id))

    def get_schedule_today(self) -> dict:
        dashboard = get_schedule_dashboard(self.db, self.tenant_id)
        timeline = get_enhanced_timeline(self.db, self.tenant_id)
        return {"dashboard": _serialize_model(dashboard), "timeline": _serialize_model(timeline)}

    def get_schedule_week(self) -> dict:
        timeline = get_enhanced_timeline(self.db, self.tenant_id)
        return {"timeline": _serialize_model(timeline), "week_start": date.today().isoformat()}

    # ── Shop Floor ─────────────────────────────────────────────────────────

    def get_shop_floor(self) -> dict:
        return {
            "summary": _serialize_model(get_shop_floor_summary(self.db, self.tenant_id)),
            "grid": _serialize_model(get_shop_floor_grid(self.db, self.tenant_id)),
        }

    def get_shop_floor_live(self) -> dict:
        return {
            "summary": _serialize_model(get_shop_floor_summary(self.db, self.tenant_id)),
            "grid": _serialize_model(get_shop_floor_grid(self.db, self.tenant_id)),
            "alerts": _serialize_model(get_shop_floor_alerts(self.db, self.tenant_id)),
            "timeline": _serialize_model(get_shop_floor_timeline(self.db, self.tenant_id)),
        }

    def get_shop_floor_status(self) -> dict:
        return _serialize_model(get_shop_floor_summary(self.db, self.tenant_id))

    def update_shop_floor(self, user: User, payload: ShopFloorUpdateRequest) -> dict:
        machine = None
        if payload.machine_id:
            machine = self.machines.get_by_id(payload.machine_id)
        elif payload.machine_code:
            machine = self.machines.get_by_code(payload.machine_code)
        if machine and payload.status:
            machine.status = payload.status
            self.machines.save(machine)
        if payload.work_order_id and payload.produced_quantity:
            wo = self.work_orders.get_by_id(payload.work_order_id)
            if wo and operator_can_access_work_order(user, wo):
                wo.actual_quantity = float(wo.actual_quantity or 0) + payload.produced_quantity
                self.work_orders.save(wo)
        return {"updated": True, "machine_id": machine.id if machine else None}

    # ── Allocation ───────────────────────────────────────────────────────

    def get_allocation(self) -> dict:
        return {
            "summary": _serialize_model(get_allocation_summary(self.db, self.tenant_id)),
            "rows": _serialize_model(get_allocation_list(self.db, self.tenant_id)),
        }

    def get_operator_allocation(self, user: User) -> dict:
        rows = get_allocation_list(self.db, self.tenant_id)
        if user_is_admin(user) or "Operator" not in set(get_role_names(user)):
            return {"rows": _serialize_model(rows)}
        filtered = [
            r for r in rows
            if r.operator_name == user.full_name
            or (user.assigned_machine_id and r.machine_id == user.assigned_machine_id)
        ]
        return {"rows": _serialize_model(filtered)}

    def get_allocation_for_machine(self, machine_id: int) -> dict:
        rows = get_allocation_list(self.db, self.tenant_id)
        filtered = [r for r in rows if r.machine_id == machine_id]
        machine = self.get_machine(machine_id)
        return {"machine": machine, "allocations": _serialize_model(filtered)}

    # ── Batches ──────────────────────────────────────────────────────────

    def list_batches(self) -> list[dict]:
        return _serialize_model(list_batches_enriched(self.db, self.tenant_id)) or []

    def get_batch(self, batch_id: int) -> dict:
        detail = get_batch_detail(self.db, self.tenant_id, batch_id)
        if not detail:
            raise HTTPException(status_code=404, detail="Batch not found")
        return _serialize_model(detail)

    def list_running_batches(self) -> list[dict]:
        batches = self.batches.list_by_status("in_process", "running")
        return [{"id": b.id, "batch_code": b.batch_code, "quantity": float(b.quantity), "status": b.status} for b in batches]

    def list_completed_batches(self) -> list[dict]:
        batches = self.batches.list_by_status("completed")
        return [{"id": b.id, "batch_code": b.batch_code, "quantity": float(b.quantity), "status": b.status} for b in batches]

    def update_batch(self, user: User, payload: BatchUpdateRequest) -> dict:
        batch = self.batches.get_by_id(payload.batch_id)
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        wo = self.work_orders.get_by_id(batch.work_order_id) if batch.work_order_id else None
        if wo and not operator_can_access_work_order(user, wo):
            raise HTTPException(status_code=403, detail="Access denied to this batch")
        if payload.quantity is not None:
            batch.quantity = payload.quantity
        if payload.status:
            batch.status = payload.status
        if not batch.produced_at and payload.status in ("completed", "running"):
            batch.produced_at = datetime.now(timezone.utc)
        self.batches.save(batch)
        return {"id": batch.id, "batch_code": batch.batch_code, "quantity": float(batch.quantity), "status": batch.status}

    def report_breakdown(self, user: User, payload: MachineBreakdownRequest) -> dict:
        machine = None
        if payload.machine_id:
            machine = self.machines.get_by_id(payload.machine_id)
        elif payload.machine_code:
            machine = self.machines.get_by_code(payload.machine_code)
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        machine.status = "breakdown"
        self.machines.save(machine)
        return {
            "machine_code": machine.code,
            "status": machine.status,
            "description": payload.description,
        }

    # ── Notifications ────────────────────────────────────────────────────

    def get_notifications(self, user: User) -> dict:
        return NotificationManagementService(self.db, user).list_notifications()

    def mark_notifications_read(self, user: User, notification_ids: list[str] | None) -> dict:
        return mark_notifications_read(self.db, user, notification_ids)

    def clear_notifications(self, user: User) -> dict:
        return clear_all_notifications(self.db, user)

    # ── Profile ────────────────────────────────────────────────────────────

    def get_profile(self, user: User) -> OperatorProfileRead:
        return OperatorProfileRead(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            tenant_id=user.tenant_id,
            roles=get_role_names(user),
            assigned_machine_id=user.assigned_machine_id,
            plant_code=user.plant_code,
        )

    # ── Notifications ────────────────────────────────────────────────────
