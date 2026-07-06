from pydantic import BaseModel, ConfigDict


class WarehouseBase(BaseModel):
    tenant_id: int
    name: str
    code: str
    capacity: int | None = None
    is_primary: bool = False


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseRead(WarehouseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class SupplierBase(BaseModel):
    tenant_id: int
    name: str
    contact: str | None = None
    email: str | None = None
    phone: str | None = None
    approval_status: str = "approved"


class SupplierCreate(SupplierBase):
    pass


class SupplierRead(SupplierBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class InventoryItemBase(BaseModel):
    tenant_id: int
    supplier_id: int | None = None
    sku: str
    barcode: str | None = None
    name: str
    description: str | None = None
    unit: str = "pcs"
    unit_cost: float | None = None
    reorder_level: int = 0
    item_type: str = "raw_material"  # raw_material, finished_good
    is_active: bool = True


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemRead(InventoryItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class StockLevelBase(BaseModel):
    warehouse_id: int
    item_id: int
    quantity: int = 0


class StockLevelCreate(StockLevelBase):
    pass


class StockLevelRead(StockLevelBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class StockMovementBase(BaseModel):
    tenant_id: int
    warehouse_id: int
    item_id: int
    quantity: int
    movement_type: str  # in, out, adjustment


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementRead(StockMovementBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
