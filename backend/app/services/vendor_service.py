"""Vendor (supplier) master — enriched list, summary, detail, and updates."""

from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.inventory import Supplier
from app.models.procurement import GoodsReceipt, PurchaseOrder, SupplierPayment
from app.schemas.vendor import (
    VendorCreate,
    VendorDetailRead,
    VendorLedgerEntry,
    VendorListRead,
    VendorPaymentRead,
    VendorPurchaseOrderRead,
    VendorSummaryRead,
    VendorUpdate,
)


def _outstanding_for_supplier(db: Session, tenant_id: int, supplier_id: int) -> float:
    po_total = db.scalar(
        select(func.coalesce(func.sum(PurchaseOrder.total_amount), 0)).where(
            PurchaseOrder.tenant_id == tenant_id,
            PurchaseOrder.supplier_id == supplier_id,
            PurchaseOrder.status.notin_(("cancelled", "draft")),
        )
    ) or 0
    paid = db.scalar(
        select(func.coalesce(func.sum(SupplierPayment.amount), 0)).where(
            SupplierPayment.tenant_id == tenant_id,
            SupplierPayment.supplier_id == supplier_id,
        )
    ) or 0
    return max(float(po_total) - float(paid), 0.0)


def _vendor_code(supplier: Supplier) -> str:
    if supplier.vendor_code:
        return supplier.vendor_code
    return f"VEN{supplier.id:03d}"


def _to_list_read(db: Session, tenant_id: int, supplier: Supplier) -> VendorListRead:
    data = VendorListRead.model_validate(supplier)
    data.vendor_code = _vendor_code(supplier)
    data.outstanding = _outstanding_for_supplier(db, tenant_id, supplier.id)
    return data


def list_vendors_enriched(db: Session, tenant_id: int) -> list[VendorListRead]:
    suppliers = list(
        db.scalars(
            select(Supplier)
            .where(Supplier.tenant_id == tenant_id)
            .order_by(Supplier.name)
        ).all()
    )
    return [_to_list_read(db, tenant_id, s) for s in suppliers]


def get_vendor_summary(db: Session, tenant_id: int) -> VendorSummaryRead:
    suppliers = list(
        db.scalars(select(Supplier).where(Supplier.tenant_id == tenant_id)).all()
    )
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    active = sum(1 for s in suppliers if s.status == "active")
    inactive = sum(1 for s in suppliers if s.status != "active")
    pending = sum(1 for s in suppliers if s.approval_status == "pending")
    new_month = sum(
        1
        for s in suppliers
        if s.created_at and s.created_at.replace(tzinfo=timezone.utc) >= month_start
    )
    outstanding = sum(_outstanding_for_supplier(db, tenant_id, s.id) for s in suppliers)
    return VendorSummaryRead(
        total_vendors=len(suppliers),
        active_vendors=active,
        inactive_vendors=inactive,
        pending_approval=pending,
        outstanding_payables=round(outstanding, 2),
        new_this_month=new_month,
    )


def get_vendor_detail(db: Session, tenant_id: int, vendor_id: int) -> VendorDetailRead | None:
    supplier = db.scalars(
        select(Supplier).where(
            Supplier.id == vendor_id, Supplier.tenant_id == tenant_id
        )
    ).first()
    if not supplier:
        return None

    pos = list(
        db.scalars(
            select(PurchaseOrder)
            .where(
                PurchaseOrder.tenant_id == tenant_id,
                PurchaseOrder.supplier_id == vendor_id,
            )
            .order_by(PurchaseOrder.order_date.desc())
        ).all()
    )
    payments = list(
        db.scalars(
            select(SupplierPayment)
            .where(
                SupplierPayment.tenant_id == tenant_id,
                SupplierPayment.supplier_id == vendor_id,
            )
            .order_by(SupplierPayment.payment_date.desc())
        ).all()
    )

    completed = sum(1 for p in pos if p.status in ("received", "completed", "closed"))
    pending = sum(1 for p in pos if p.status in ("draft", "approved", "pending"))
    total_value = sum(float(p.total_amount or 0) for p in pos)
    last_date = pos[0].order_date if pos else None

    detail = VendorDetailRead.model_validate(supplier)
    detail.vendor_code = _vendor_code(supplier)
    detail.outstanding = _outstanding_for_supplier(db, tenant_id, vendor_id)
    detail.total_purchase_orders = len(pos)
    detail.completed_orders = completed
    detail.pending_orders = pending
    detail.total_purchase_value = round(total_value, 2)
    detail.last_purchase_date = last_date
    detail.purchase_orders = [
        VendorPurchaseOrderRead.model_validate(p) for p in pos[:20]
    ]
    detail.payments = [VendorPaymentRead.model_validate(p) for p in payments[:20]]
    detail.ledger = _build_ledger(pos, payments)
    return detail


def _build_ledger(
    pos: list[PurchaseOrder], payments: list[SupplierPayment]
) -> list[VendorLedgerEntry]:
    entries: list[VendorLedgerEntry] = []
    for po in pos:
        entries.append(
            VendorLedgerEntry(
                date=po.order_date,
                reference=po.po_number,
                description=f"Purchase Order — {po.status}",
                debit=float(po.total_amount or 0),
                credit=0,
                balance=0,
            )
        )
    for pay in payments:
        entries.append(
            VendorLedgerEntry(
                date=pay.payment_date,
                reference=pay.reference or f"PAY-{pay.id}",
                description=f"Payment ({pay.payment_method})",
                debit=0,
                credit=float(pay.amount or 0),
                balance=0,
            )
        )
    entries.sort(key=lambda e: e.date)
    running = 0.0
    for e in entries:
        running += e.debit - e.credit
        e.balance = round(running, 2)
    return entries[-30:]


def create_vendor(db: Session, payload: VendorCreate) -> Supplier:
    if not payload.vendor_code:
        count = db.scalar(
            select(func.count(Supplier.id)).where(
                Supplier.tenant_id == payload.tenant_id
            )
        ) or 0
        payload.vendor_code = f"VEN{count + 1:03d}"
    supplier = Supplier(**payload.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def update_vendor(
    db: Session, tenant_id: int, vendor_id: int, payload: VendorUpdate
) -> Supplier | None:
    supplier = db.scalars(
        select(Supplier).where(
            Supplier.id == vendor_id, Supplier.tenant_id == tenant_id
        )
    ).first()
    if not supplier:
        return None
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(supplier, key, value)
    db.commit()
    db.refresh(supplier)
    return supplier


def deactivate_vendor(db: Session, tenant_id: int, vendor_id: int) -> Supplier | None:
    return update_vendor(
        db, tenant_id, vendor_id, VendorUpdate(status="inactive")
    )
