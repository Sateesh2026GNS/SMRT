from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.inventory import (
    InventoryItem,
    StockLevel,
    StockMovement,
    Supplier,
    Warehouse,
)
from app.models.product import Product
from app.schemas.inventory import (
    InventoryItemCreate,
    StockLevelCreate,
    StockMovementCreate,
    SupplierCreate,
    WarehouseCreate,
)


def create_warehouse(db: Session, payload: WarehouseCreate) -> Warehouse:
    wh = Warehouse(**payload.model_dump())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


def list_warehouses(db: Session, tenant_id: int) -> list[Warehouse]:
    stmt = select(Warehouse).where(Warehouse.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_supplier(db: Session, payload: SupplierCreate) -> Supplier:
    s = Supplier(**payload.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def list_suppliers(db: Session, tenant_id: int) -> list[Supplier]:
    stmt = select(Supplier).where(Supplier.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def update_supplier_approval(
    db: Session, tenant_id: int, supplier_id: int, approval_status: str
) -> Supplier | None:
    supplier = db.scalars(
        select(Supplier).where(
            Supplier.id == supplier_id, Supplier.tenant_id == tenant_id
        )
    ).first()
    if not supplier:
        return None
    supplier.approval_status = approval_status
    db.commit()
    db.refresh(supplier)
    return supplier


def create_inventory_item(
    db: Session, payload: InventoryItemCreate
) -> InventoryItem:
    item = InventoryItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_inventory_items(
    db: Session,
    tenant_id: int,
    low_stock_only: bool = False,
    item_type: str | None = None,
) -> list[InventoryItem]:
    stmt = select(InventoryItem).where(
        InventoryItem.tenant_id == tenant_id, InventoryItem.is_active
    )
    if item_type:
        stmt = stmt.where(InventoryItem.item_type == item_type)
    items = list(db.scalars(stmt).all())
    if low_stock_only:
        result = []
        for item in items:
            total = (
                db.scalars(
                    select(func.coalesce(func.sum(StockLevel.quantity), 0)).where(
                        StockLevel.item_id == item.id
                    )
                ).first()
                or 0
            )
            if total < item.reorder_level:
                result.append(item)
        return result
    return items


def get_item_by_barcode(db: Session, tenant_id: int, barcode: str) -> InventoryItem | None:
    stmt = select(InventoryItem).where(
        InventoryItem.tenant_id == tenant_id,
        InventoryItem.barcode == barcode,
        InventoryItem.is_active,
    )
    return db.scalars(stmt).first()


def get_stock_by_item(db: Session, item_id: int) -> list[StockLevel]:
    stmt = select(StockLevel).where(StockLevel.item_id == item_id)
    return list(db.scalars(stmt).all())


def get_total_stock(db: Session, item_id: int) -> int:
    r = db.scalars(
        select(func.coalesce(func.sum(StockLevel.quantity), 0)).where(
            StockLevel.item_id == item_id
        )
    ).first()
    return int(r) if r is not None else 0


def create_stock_level(db: Session, payload: StockLevelCreate) -> StockLevel:
    sl = StockLevel(**payload.model_dump())
    db.add(sl)
    db.commit()
    db.refresh(sl)
    return sl


def update_stock_level(
    db: Session, warehouse_id: int, item_id: int, quantity: int
) -> StockLevel | None:
    stmt = select(StockLevel).where(
        StockLevel.warehouse_id == warehouse_id, StockLevel.item_id == item_id
    )
    sl = db.scalars(stmt).first()
    if sl:
        sl.quantity = quantity
        db.commit()
        db.refresh(sl)
        return sl
    return None


def record_stock_movement(
    db: Session, payload: StockMovementCreate
) -> StockMovement:
    mov = StockMovement(**payload.model_dump())
    db.add(mov)
    stmt = select(StockLevel).where(
        StockLevel.warehouse_id == payload.warehouse_id,
        StockLevel.item_id == payload.item_id,
    )
    sl = db.scalars(stmt).first()
    if sl:
        if payload.movement_type == "in":
            sl.quantity += payload.quantity
        elif payload.movement_type == "out":
            sl.quantity = max(0, sl.quantity - abs(payload.quantity))
        elif payload.movement_type == "adjustment":
            sl.quantity = max(0, sl.quantity + payload.quantity)
    elif not sl and payload.movement_type == "in":
        db.add(
            StockLevel(
                warehouse_id=payload.warehouse_id,
                item_id=payload.item_id,
                quantity=payload.quantity,
            )
        )
    db.commit()
    db.refresh(mov)
    return mov


def get_inventory_dashboard(
    db: Session, tenant_id: int, item_type: str | None = None
) -> list[dict]:
    """Items with total stock, reorder status, stock value."""
    stmt = select(InventoryItem).where(
        InventoryItem.tenant_id == tenant_id, InventoryItem.is_active
    )
    if item_type:
        stmt = stmt.where(InventoryItem.item_type == item_type)
    items = list(db.scalars(stmt).all())
    result = []
    for item in items:
        total = get_total_stock(db, item.id)
        stock_value = (item.unit_cost or 0) * total if item.unit_cost else None
        needs_reorder = total < item.reorder_level if item.reorder_level else False
        result.append(
            {
                "id": item.id,
                "sku": item.sku,
                "barcode": item.barcode,
                "name": item.name,
                "unit": item.unit,
                "unit_cost": float(item.unit_cost) if item.unit_cost else None,
                "reorder_level": item.reorder_level,
                "total_quantity": total,
                "stock_value": round(stock_value, 2) if stock_value is not None else None,
                "needs_reorder": needs_reorder,
                "item_type": item.item_type,
            }
        )
    return result


def list_stock_levels_by_warehouse(db: Session, warehouse_id: int) -> list[StockLevel]:
    stmt = select(StockLevel).where(StockLevel.warehouse_id == warehouse_id)
    return list(db.scalars(stmt).all())


def list_stock_movements(
    db: Session, tenant_id: int, item_id: int | None = None
) -> list[StockMovement]:
    stmt = select(StockMovement).where(StockMovement.tenant_id == tenant_id)
    if item_id is not None:
        stmt = stmt.where(StockMovement.item_id == item_id)
    stmt = stmt.order_by(StockMovement.id.desc())
    return list(db.scalars(stmt).all())


def get_default_warehouse(db: Session, tenant_id: int) -> Warehouse | None:
    wh = db.scalars(
        select(Warehouse).where(
            Warehouse.tenant_id == tenant_id, Warehouse.is_primary.is_(True)
        )
    ).first()
    if wh:
        return wh
    return db.scalars(select(Warehouse).where(Warehouse.tenant_id == tenant_id)).first()


def find_or_create_finished_good_for_product(
    db: Session, tenant_id: int, product: Product
) -> InventoryItem:
    item = db.scalars(
        select(InventoryItem).where(
            InventoryItem.tenant_id == tenant_id,
            InventoryItem.sku == product.sku,
        )
    ).first()
    if item:
        return item
    item = InventoryItem(
        tenant_id=tenant_id,
        sku=product.sku,
        name=product.name,
        description=product.description,
        unit_cost=float(product.unit_cost) if product.unit_cost else None,
        item_type="finished_good",
        is_active=True,
    )
    db.add(item)
    db.flush()
    return item
