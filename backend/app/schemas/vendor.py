from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class VendorBase(BaseModel):
    tenant_id: int
    name: str
    vendor_code: str | None = None
    contact: str | None = None
    email: str | None = None
    phone: str | None = None
    alternate_contact: str | None = None
    website: str | None = None
    approval_status: str = "approved"
    status: str = "active"
    vendor_type: str | None = None
    category: str | None = None
    material_type: str | None = None
    gstin: str | None = None
    pan: str | None = None
    msme: str | None = None
    billing_address: str | None = None
    factory_address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = "India"
    pincode: str | None = None
    bank_name: str | None = None
    account_number: str | None = None
    ifsc: str | None = None
    payment_terms: str | None = None
    credit_days: int | None = None
    rating: float | None = None
    quality_score: float | None = None
    delivery_score: float | None = None
    price_score: float | None = None
    service_score: float | None = None


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    name: str | None = None
    vendor_code: str | None = None
    contact: str | None = None
    email: str | None = None
    phone: str | None = None
    alternate_contact: str | None = None
    website: str | None = None
    approval_status: str | None = None
    status: str | None = None
    vendor_type: str | None = None
    category: str | None = None
    material_type: str | None = None
    gstin: str | None = None
    pan: str | None = None
    msme: str | None = None
    billing_address: str | None = None
    factory_address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    pincode: str | None = None
    bank_name: str | None = None
    account_number: str | None = None
    ifsc: str | None = None
    payment_terms: str | None = None
    credit_days: int | None = None
    rating: float | None = None
    quality_score: float | None = None
    delivery_score: float | None = None
    price_score: float | None = None
    service_score: float | None = None


class VendorListRead(VendorBase):
    id: int
    outstanding: float = 0
    created_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class VendorSummaryRead(BaseModel):
    total_vendors: int = 0
    active_vendors: int = 0
    inactive_vendors: int = 0
    pending_approval: int = 0
    outstanding_payables: float = 0
    new_this_month: int = 0


class VendorPurchaseOrderRead(BaseModel):
    id: int
    po_number: str
    order_date: date
    status: str
    total_amount: float | None = None
    model_config = ConfigDict(from_attributes=True)


class VendorPaymentRead(BaseModel):
    id: int
    payment_date: date
    amount: float
    payment_method: str
    reference: str | None = None
    model_config = ConfigDict(from_attributes=True)


class VendorLedgerEntry(BaseModel):
    date: date
    reference: str
    description: str
    debit: float = 0
    credit: float = 0
    balance: float = 0


class VendorDetailRead(VendorListRead):
    total_purchase_orders: int = 0
    completed_orders: int = 0
    pending_orders: int = 0
    total_purchase_value: float = 0
    last_purchase_date: date | None = None
    average_delivery_days: float | None = None
    purchase_orders: list[VendorPurchaseOrderRead] = Field(default_factory=list)
    payments: list[VendorPaymentRead] = Field(default_factory=list)
    ledger: list[VendorLedgerEntry] = Field(default_factory=list)
