from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    po_number: Mapped[str] = mapped_column(String(64), nullable=False)
    order_date: Mapped[date] = mapped_column(Date, nullable=False)
    expected_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(32), default="draft", nullable=False)
    total_amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    notes: Mapped[str | None] = mapped_column(Text)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    line_items = relationship(
        "PurchaseOrderLine",
        back_populates="purchase_order",
        cascade="all, delete-orphan",
    )
    goods_receipts = relationship(
        "GoodsReceipt",
        back_populates="purchase_order",
        cascade="all, delete-orphan",
    )


class PurchaseOrderLine(Base, TimestampMixin):
    __tablename__ = "purchase_order_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    purchase_order_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_orders.id"), nullable=False
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("inventory_items.id"), nullable=False
    )
    quantity: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    unit_price: Mapped[float | None] = mapped_column(Numeric(12, 2))
    line_total: Mapped[float | None] = mapped_column(Numeric(12, 2))

    purchase_order = relationship("PurchaseOrder", back_populates="line_items")
    item = relationship("InventoryItem")


class MaterialRequest(Base, TimestampMixin):
    __tablename__ = "material_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    mr_number: Mapped[str] = mapped_column(String(64), nullable=False)
    request_date: Mapped[date] = mapped_column(Date, nullable=False)
    required_date: Mapped[date | None] = mapped_column(Date)
    requested_by: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    line_items = relationship(
        "MaterialRequestLine",
        back_populates="material_request",
        cascade="all, delete-orphan",
    )


class MaterialRequestLine(Base, TimestampMixin):
    __tablename__ = "material_request_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    material_request_id: Mapped[int] = mapped_column(
        ForeignKey("material_requests.id"), nullable=False
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("inventory_items.id"), nullable=False
    )
    quantity: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(255))

    material_request = relationship("MaterialRequest", back_populates="line_items")
    item = relationship("InventoryItem")


class GoodsReceipt(Base, TimestampMixin):
    __tablename__ = "goods_receipts"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    purchase_order_id: Mapped[int | None] = mapped_column(ForeignKey("purchase_orders.id"))
    grn_number: Mapped[str] = mapped_column(String(64), nullable=False)
    receipt_date: Mapped[date] = mapped_column(Date, nullable=False)
    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(32), default="received", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    purchase_order = relationship("PurchaseOrder", back_populates="goods_receipts")
    warehouse = relationship("Warehouse")
    line_items = relationship(
        "GoodsReceiptLine",
        back_populates="goods_receipt",
        cascade="all, delete-orphan",
    )


class GoodsReceiptLine(Base, TimestampMixin):
    __tablename__ = "goods_receipt_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    goods_receipt_id: Mapped[int] = mapped_column(
        ForeignKey("goods_receipts.id"), nullable=False
    )
    item_id: Mapped[int] = mapped_column(
        ForeignKey("inventory_items.id"), nullable=False
    )
    quantity_received: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    quantity_rejected: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)

    goods_receipt = relationship("GoodsReceipt", back_populates="line_items")
    item = relationship("InventoryItem")


class SupplierPayment(Base, TimestampMixin):
    __tablename__ = "supplier_payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"), nullable=False, index=True
    )
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(64), default="bank", nullable=False)
    reference: Mapped[str | None] = mapped_column(String(128))
    notes: Mapped[str | None] = mapped_column(Text)

    supplier = relationship("Supplier")

