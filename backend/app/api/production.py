from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_action, require_permission, tenant_scope, user_can_action
from app.models.user import User
from app.services import product_service
from app.schemas.product import (
    BomItemCreate,
    BomItemRead,
    ProductCreate,
    ProductDetailRead,
    ProductUpdate,
)
from app.schemas.production import (
    BatchCreate,
    BatchRead,
    DailyProductionReportCreate,
    DailyProductionReportRead,
    MachineCreate,
    MachineRead,
    MachineStatusEventCreate,
    MachineStatusEventRead,
    MachineUpdate,
    ProductRead,
    ProductionOrderCreate,
    ProductionOrderRead,
    WorkOrderCreate,
    WorkOrderRead,
    WorkOrderQuickCreate,
    WorkOrderUpdate,
)
from app.services.production_service import (
    create_batch,
    create_daily_production_report,
    create_machine,
    create_machine_status_event,
    create_production_order,
    create_work_order,
    list_batches,
    list_daily_production_reports,
    list_machine_status_events,
    list_machines,
    list_production_orders,
    list_products,
    list_work_orders,
    update_machine_status,
    update_work_order,
)

router = APIRouter(prefix="/production", tags=["production"])

MODULE = "production"


@router.post("/seed-products")
def seed_products_endpoint(
    user: User = Depends(require_action(MODULE, "create")),
    db: Session = Depends(get_db),
):
    """Seed sample products for the current tenant (idempotent)."""
    from app.core.seed_products import seed_products

    seed_products(db, user.tenant_id)
    return {"status": "ok", "message": "Sample products ensured for your tenant"}


@router.get("/products", response_model=list[ProductRead])
def list_products_endpoint(
    user: User = Depends(require_action(MODULE, "read")),
    db: Session = Depends(get_db),
) -> list[ProductRead]:
    return list_products(db, user.tenant_id)


@router.get("/products/{product_id}", response_model=ProductDetailRead)
def get_product_endpoint(
    product_id: int,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> ProductDetailRead:
    product = product_service.get_product(db, tenant_id, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.post("/products/manage", response_model=ProductDetailRead)
def create_product_endpoint(
    payload: ProductCreate,
    user: User = Depends(require_action(MODULE, "create")),
    db: Session = Depends(get_db),
) -> ProductDetailRead:
    payload.tenant_id = user.tenant_id
    return product_service.create_product(db, payload)


@router.patch("/products/{product_id}", response_model=ProductDetailRead)
def update_product_endpoint(
    product_id: int,
    payload: ProductUpdate,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> ProductDetailRead:
    product = product_service.update_product(db, tenant_id, product_id, payload)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.delete("/products/{product_id}")
def delete_product_endpoint(
    product_id: int,
    user: User = Depends(require_action(MODULE, "delete")),
    db: Session = Depends(get_db),
):
    if not product_service.delete_product(db, user.tenant_id, product_id):
        raise HTTPException(404, "Product not found")
    return {"deleted": True, "id": product_id}


@router.get("/products/{product_id}/bom", response_model=list[BomItemRead])
def list_bom_endpoint(
    product_id: int,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> list[BomItemRead]:
    return product_service.list_bom(db, tenant_id, product_id)


@router.post("/products/{product_id}/bom", response_model=BomItemRead)
def add_bom_item_endpoint(
    product_id: int,
    payload: BomItemCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> BomItemRead:
    payload.tenant_id = user.tenant_id
    payload.product_id = product_id
    return product_service.add_bom_item(db, payload)


@router.delete("/products/bom/{bom_id}")
def delete_bom_item_endpoint(
    bom_id: int,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    if not product_service.delete_bom_item(db, tenant_id, bom_id):
        raise HTTPException(404, "BOM item not found")
    return {"deleted": True, "id": bom_id}


@router.patch("/orders/{order_id}/status", response_model=ProductionOrderRead)
def update_production_order_status_endpoint(
    order_id: int,
    status: str = Query(...),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> ProductionOrderRead:
    from app.services.production_service import update_production_order_status

    order = update_production_order_status(db, order_id, tenant_id, status)
    if not order:
        raise HTTPException(404, "Production order not found")
    return order


@router.post("/orders", response_model=ProductionOrderRead)
def create_production_order_endpoint(
    payload: ProductionOrderCreate,
    user: User = Depends(require_action(MODULE, "create")),
    db: Session = Depends(get_db),
) -> ProductionOrderRead:
    payload.tenant_id = user.tenant_id
    return create_production_order(db, payload)


@router.get("/orders", response_model=list[ProductionOrderRead])
def list_production_orders_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[ProductionOrderRead]:
    return list_production_orders(db, tenant_id)


@router.post("/work-orders", response_model=WorkOrderRead)
def create_work_order_endpoint(
    payload: WorkOrderCreate,
    user: User = Depends(require_action(MODULE, "create")),
    db: Session = Depends(get_db),
) -> WorkOrderRead:
    payload.tenant_id = user.tenant_id
    if user.plant_code:
        payload.plant_code = user.plant_code
    return create_work_order(db, payload)


@router.post("/work-orders/quick", response_model=WorkOrderRead)
def quick_create_work_order_endpoint(
    payload: WorkOrderQuickCreate,
    user: User = Depends(require_action(MODULE, "create")),
    db: Session = Depends(get_db),
) -> WorkOrderRead:
    from app.services.production_service import quick_create_work_order

    payload.tenant_id = user.tenant_id
    return quick_create_work_order(db, payload)


@router.patch("/work-orders/{work_order_id}", response_model=WorkOrderRead)
def update_work_order_endpoint(
    work_order_id: int,
    payload: WorkOrderUpdate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> WorkOrderRead:
    if payload.status is not None and not user_can_action(user, MODULE, "update"):
        raise HTTPException(403, "You cannot change work order status")
    if payload.actual_quantity is not None and not user_can_action(user, MODULE, "update_qty"):
        raise HTTPException(403, "You cannot update production quantity")
    wo = update_work_order(
        db,
        work_order_id,
        user.tenant_id,
        user=user,
        actual_quantity=payload.actual_quantity,
        status=payload.status if user_can_action(user, MODULE, "update") else None,
        machine_id=payload.machine_id if user_can_action(user, MODULE, "update") else None,
    )
    if not wo:
        raise HTTPException(404, "Work order not found")
    return wo


@router.get("/work-orders", response_model=list[WorkOrderRead])
def list_work_orders_endpoint(
    user: User = Depends(require_action(MODULE, "read")),
    production_order_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[WorkOrderRead]:
    return list_work_orders(db, user.tenant_id, production_order_id, user=user)


@router.post("/batches", response_model=BatchRead)
def create_batch_endpoint(
    payload: BatchCreate,
    user: User = Depends(require_action(MODULE, "create_entry")),
    db: Session = Depends(get_db),
) -> BatchRead:
    payload.tenant_id = user.tenant_id
    return create_batch(db, payload)


@router.get("/batches", response_model=list[BatchRead])
def list_batches_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    work_order_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[BatchRead]:
    return list_batches(db, tenant_id, work_order_id)


@router.post("/machines", response_model=MachineRead)
def create_machine_endpoint(
    payload: MachineCreate,
    user: User = Depends(require_action(MODULE, "create")),
    db: Session = Depends(get_db),
) -> MachineRead:
    payload.tenant_id = user.tenant_id
    return create_machine(db, payload)


@router.patch("/machines/{machine_id}", response_model=MachineRead)
def update_machine_endpoint(
    machine_id: int,
    payload: MachineUpdate,
    user: User = Depends(require_action(MODULE, "update_machine_status")),
    db: Session = Depends(get_db),
) -> MachineRead:
    m = update_machine_status(db, machine_id, user.tenant_id, payload.status, user=user)
    if not m:
        raise HTTPException(404, "Machine not found")
    return m


@router.get("/machines", response_model=list[MachineRead])
def list_machines_endpoint(
    user: User = Depends(require_action(MODULE, "read")),
    db: Session = Depends(get_db),
) -> list[MachineRead]:
    return list_machines(db, user.tenant_id, user=user)


@router.post("/machine-status", response_model=MachineStatusEventRead)
def create_machine_status_event_endpoint(
    payload: MachineStatusEventCreate,
    user: User = Depends(require_action(MODULE, "report_breakdown")),
    db: Session = Depends(get_db),
) -> MachineStatusEventRead:
    payload.tenant_id = user.tenant_id
    return create_machine_status_event(db, payload)


@router.get("/machine-status", response_model=list[MachineStatusEventRead])
def list_machine_status_events_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    machine_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[MachineStatusEventRead]:
    return list_machine_status_events(db, tenant_id, machine_id)


@router.post("/daily-reports", response_model=DailyProductionReportRead)
def create_daily_production_report_endpoint(
    payload: DailyProductionReportCreate,
    user: User = Depends(require_action(MODULE, "create_entry")),
    db: Session = Depends(get_db),
) -> DailyProductionReportRead:
    payload.tenant_id = user.tenant_id
    return create_daily_production_report(db, payload, created_by_user_id=user.id)


@router.get("/daily-reports", response_model=list[DailyProductionReportRead])
def list_daily_production_reports_endpoint(
    user: User = Depends(require_action(MODULE, "read")),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    work_order_id: int | None = Query(None),
    machine_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[DailyProductionReportRead]:
    return list_daily_production_reports(
        db,
        user.tenant_id,
        date_from=date_from,
        date_to=date_to,
        work_order_id=work_order_id,
        machine_id=machine_id,
        user=user,
    )
