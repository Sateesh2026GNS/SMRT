from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.models.inventory import (
    InventoryItem,
    StockLevel,
    StockMovement,
    Warehouse,
)

router = APIRouter(prefix="/warehouse", tags=["Warehouse Management"])

MODULE = "inventory"


@router.get("/locations")
def get_warehouse_locations(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Warehouses with their aggregate stored quantity and distinct item count."""
    warehouses = list(
        db.scalars(select(Warehouse).where(Warehouse.tenant_id == tenant_id)).all()
    )
    result = []
    for wh in warehouses:
        totals = db.execute(
            select(
                func.coalesce(func.sum(StockLevel.quantity), 0),
                func.count(func.distinct(StockLevel.item_id)),
            ).where(StockLevel.warehouse_id == wh.id)
        ).one()
        result.append(
            {
                "id": wh.id,
                "name": wh.name,
                "code": wh.code,
                "capacity": wh.capacity,
                "is_primary": wh.is_primary,
                "total_quantity": int(totals[0] or 0),
                "item_count": int(totals[1] or 0),
            }
        )
    return result


@router.get("/bin-management")
def get_bin_management(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Stock placement (item x warehouse) acting as bin-level storage records."""
    rows = db.execute(
        select(
            StockLevel.id,
            Warehouse.name,
            Warehouse.code,
            InventoryItem.name,
            InventoryItem.sku,
            StockLevel.quantity,
            InventoryItem.reorder_level,
        )
        .join(Warehouse, StockLevel.warehouse_id == Warehouse.id)
        .join(InventoryItem, StockLevel.item_id == InventoryItem.id)
        .where(Warehouse.tenant_id == tenant_id)
        .order_by(Warehouse.name, InventoryItem.name)
    ).all()
    return [
        {
            "id": r[0],
            "warehouse": r[1],
            "warehouse_code": r[2],
            "item": r[3],
            "sku": r[4],
            "quantity": int(r[5] or 0),
            "reorder_level": int(r[6] or 0),
            "below_reorder": (r[5] or 0) < (r[6] or 0),
        }
        for r in rows
    ]


@router.get("/stock-transfers")
def get_stock_transfers(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Recent stock movements (in / out / adjustment) for the tenant."""
    rows = db.execute(
        select(
            StockMovement.id,
            Warehouse.name,
            InventoryItem.name,
            StockMovement.quantity,
            StockMovement.movement_type,
            StockMovement.created_at,
        )
        .join(Warehouse, StockMovement.warehouse_id == Warehouse.id)
        .join(InventoryItem, StockMovement.item_id == InventoryItem.id)
        .where(StockMovement.tenant_id == tenant_id)
        .order_by(StockMovement.created_at.desc())
        .limit(100)
    ).all()
    return [
        {
            "id": r[0],
            "warehouse": r[1],
            "item": r[2],
            "quantity": int(r[3]),
            "movement_type": r[4],
            "date": r[5].isoformat() if r[5] else None,
        }
        for r in rows
    ]


@router.get("/warehouse-reports")
def get_warehouse_reports(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Summary report: utilisation per warehouse."""
    warehouses = list(
        db.scalars(select(Warehouse).where(Warehouse.tenant_id == tenant_id)).all()
    )
    report = []
    for wh in warehouses:
        stored = db.scalar(
            select(func.coalesce(func.sum(StockLevel.quantity), 0)).where(
                StockLevel.warehouse_id == wh.id
            )
        )
        stored = int(stored or 0)
        utilisation = (
            round(stored / wh.capacity * 100, 1)
            if wh.capacity
            else None
        )
        report.append(
            {
                "warehouse": wh.name,
                "code": wh.code,
                "capacity": wh.capacity,
                "stored_quantity": stored,
                "utilisation_pct": utilisation,
            }
        )
    return report
