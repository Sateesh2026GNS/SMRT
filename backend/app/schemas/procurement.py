from datetime import date

from pydantic import BaseModel, ConfigDict


class PurchaseOrderLineBase(BaseModel):
    item_id: int
    quantity: float
    unit_price: float | None = None
    line_total: float | None = None


class PurchaseOrderLineCreate(PurchaseOrderLineBase):
    pass


class PurchaseOrderLineRead(PurchaseOrderLineBase):
    id: int
    purchase_order_id: int
    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderBase(BaseModel):
    tenant_id: int
    supplier_id: int
    po_number: str
    order_date: date
    expected_date: date | None = None
    status: str = "draft"
    total_amount: float | None = None
    notes: str | None = None


class PurchaseOrderCreate(PurchaseOrderBase):
    line_items: list[PurchaseOrderLineCreate] = []


class PurchaseOrderRead(PurchaseOrderBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderListRead(PurchaseOrderRead):
    supplier_name: str | None = None


class MaterialRequestLineBase(BaseModel):
    item_id: int
    quantity: float
    notes: str | None = None


class MaterialRequestLineCreate(MaterialRequestLineBase):
    pass


class MaterialRequestBase(BaseModel):
    tenant_id: int
    mr_number: str
    request_date: date
    required_date: date | None = None
    requested_by: str | None = None
    status: str = "pending"
    notes: str | None = None


class MaterialRequestCreate(MaterialRequestBase):
    line_items: list[MaterialRequestLineCreate] = []


class MaterialRequestRead(MaterialRequestBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class GoodsReceiptLineBase(BaseModel):
    item_id: int
    quantity_received: float
    quantity_rejected: float = 0


class GoodsReceiptLineCreate(GoodsReceiptLineBase):
    pass


class GoodsReceiptBase(BaseModel):
    tenant_id: int
    purchase_order_id: int | None = None
    grn_number: str
    receipt_date: date
    warehouse_id: int
    status: str = "received"
    notes: str | None = None


class GoodsReceiptCreate(GoodsReceiptBase):
    line_items: list[GoodsReceiptLineCreate] = []


class GoodsReceiptRead(GoodsReceiptBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class SupplierPaymentBase(BaseModel):
    tenant_id: int
    supplier_id: int
    payment_date: date
    amount: float
    payment_method: str = "bank"
    reference: str | None = None
    notes: str | None = None


class SupplierPaymentCreate(SupplierPaymentBase):
    pass


class SupplierPaymentRead(SupplierPaymentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
