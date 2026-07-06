from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemRead,
    StockLevelCreate,
    StockLevelRead,
    StockMovementCreate,
    StockMovementRead,
    SupplierCreate,
    SupplierRead,
    WarehouseCreate,
    WarehouseRead,
)
from app.services.inventory_service import (
    create_inventory_item,
    create_stock_level,
    create_supplier,
    create_warehouse,
    get_inventory_dashboard,
    get_item_by_barcode,
    get_stock_by_item,
    get_total_stock,
    list_inventory_items,
    list_stock_levels_by_warehouse,
    list_suppliers,
    list_warehouses,
    record_stock_movement,
    update_stock_level,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])

MODULE = "inventory"


@router.post("/warehouses", response_model=WarehouseRead)
def create_warehouse_endpoint(
    payload: WarehouseCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> WarehouseRead:
    payload.tenant_id = user.tenant_id
    return create_warehouse(db, payload)


@router.get("/warehouses", response_model=list[WarehouseRead])
def list_warehouses_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[WarehouseRead]:
    return list_warehouses(db, tenant_id)


@router.post("/suppliers", response_model=SupplierRead)
def create_supplier_endpoint(
    payload: SupplierCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> SupplierRead:
    payload.tenant_id = user.tenant_id
    return create_supplier(db, payload)


@router.get("/suppliers", response_model=list[SupplierRead])
def list_suppliers_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[SupplierRead]:
    return list_suppliers(db, tenant_id)


@router.post("/items", response_model=InventoryItemRead)
def create_item_endpoint(
    payload: InventoryItemCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> InventoryItemRead:
    payload.tenant_id = user.tenant_id
    return create_inventory_item(db, payload)


@router.get("/items", response_model=list[InventoryItemRead])
def list_items_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    low_stock_only: bool = Query(False),
    item_type: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[InventoryItemRead]:
    return list_inventory_items(db, tenant_id, low_stock_only, item_type)


@router.get("/items/barcode/{barcode}")
def get_item_by_barcode_endpoint(
    barcode: str,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    item = get_item_by_barcode(db, tenant_id, barcode)
    if not item:
        raise HTTPException(404, "No item found for that barcode")
    total = get_total_stock(db, item.id)
    return {
        "found": True,
        "item": InventoryItemRead.model_validate(item),
        "total_stock": total,
        "needs_reorder": total < item.reorder_level if item.reorder_level else False,
    }


@router.get("/dashboard")
def inventory_dashboard_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    item_type: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_inventory_dashboard(db, tenant_id, item_type)


@router.post("/stock-levels", response_model=StockLevelRead)
def create_stock_level_endpoint(
    payload: StockLevelCreate,
    _: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> StockLevelRead:
    return create_stock_level(db, payload)


@router.get("/stock-levels/warehouse/{warehouse_id}", response_model=list[StockLevelRead])
def list_stock_by_warehouse_endpoint(
    warehouse_id: int,
    _: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> list[StockLevelRead]:
    return list_stock_levels_by_warehouse(db, warehouse_id)


@router.get("/stock-levels/item/{item_id}", response_model=list[StockLevelRead])
def list_stock_by_item_endpoint(
    item_id: int,
    _: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> list[StockLevelRead]:
    return get_stock_by_item(db, item_id)


@router.put("/stock-levels")
def update_stock_endpoint(
    warehouse_id: int = Query(...),
    item_id: int = Query(...),
    quantity: int = Query(...),
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    sl = update_stock_level(db, warehouse_id, item_id, quantity)
    if not sl:
        raise HTTPException(404, "Stock level not found for that warehouse/item")
    from app.services.alert_service import sync_low_stock_alerts

    sync_low_stock_alerts(db, user.tenant_id)
    return {"updated": True, "quantity": sl.quantity}


@router.get("/stock-movements", response_model=list[StockMovementRead])
def list_stock_movements_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    item_id: int | None = Query(None),
    db: Session = Depends(get_db),
) -> list[StockMovementRead]:
    from app.services.inventory_service import list_stock_movements

    return list_stock_movements(db, tenant_id, item_id)


@router.post("/stock-movements", response_model=StockMovementRead)
def record_movement_endpoint(
    payload: StockMovementCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> StockMovementRead:
    if hasattr(payload, "tenant_id"):
        payload.tenant_id = user.tenant_id
    movement = record_stock_movement(db, payload)
    from app.services.alert_service import sync_low_stock_alerts

    sync_low_stock_alerts(db, user.tenant_id)
    return movement
