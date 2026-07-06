from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.sales import Customer, Invoice, InvoiceItem, Lead, Payment, Quotation, SalesOrder
from app.schemas.sales import (
    CustomerCreate,
    InvoiceCreate,
    InvoiceItemCreate,
    PaymentCreate,
    SalesOrderCreate,
    LeadCreate,
    QuotationCreate,
)


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    c = Customer(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def list_customers(db: Session, tenant_id: int) -> list[Customer]:
    stmt = select(Customer).where(Customer.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_sales_order(db: Session, payload: SalesOrderCreate) -> SalesOrder:
    so = SalesOrder(**payload.model_dump())
    db.add(so)
    db.commit()
    db.refresh(so)
    return so


def list_sales_orders(db: Session, tenant_id: int, status: str | None = None) -> list[SalesOrder]:
    stmt = (
        select(SalesOrder)
        .options(joinedload(SalesOrder.customer))
        .where(SalesOrder.tenant_id == tenant_id)
    )
    if status:
        stmt = stmt.where(SalesOrder.status == status)
    stmt = stmt.order_by(SalesOrder.order_date.desc())
    return list(db.scalars(stmt).all())


def update_sales_order_status(
    db: Session, tenant_id: int, order_id: int, status: str
) -> SalesOrder | None:
    order = db.scalars(
        select(SalesOrder).where(
            SalesOrder.id == order_id, SalesOrder.tenant_id == tenant_id
        )
    ).first()
    if not order:
        return None
    order.status = status
    db.commit()
    db.refresh(order)
    return order


def get_sales_order_with_items(
    db: Session, tenant_id: int, order_id: int
) -> SalesOrder | None:
    stmt = (
        select(SalesOrder)
        .options(joinedload(SalesOrder.customer))
        .where(SalesOrder.id == order_id, SalesOrder.tenant_id == tenant_id)
    )
    return db.scalars(stmt).first()


def _calc_gst(subtotal: float, sgst_pct: float, cgst_pct: float, igst_pct: float) -> tuple[float, float, float]:
    sgst = round(subtotal * (sgst_pct / 100), 2)
    cgst = round(subtotal * (cgst_pct / 100), 2)
    igst = round(subtotal * (igst_pct / 100), 2)
    return sgst, cgst, igst


def create_invoice(db: Session, payload: InvoiceCreate) -> Invoice:
    data = payload.model_dump(exclude={"items"})
    inv = Invoice(**data)
    db.add(inv)
    db.flush()
    subtotal = 0.0
    for item_data in payload.items:
        item = InvoiceItem(invoice_id=inv.id, **item_data)
        db.add(item)
        subtotal += item.amount
    inv.subtotal = subtotal
    sgst, cgst, igst = _calc_gst(
        subtotal, inv.sgst_pct, inv.cgst_pct, inv.igst_pct
    )
    inv.sgst_amount = sgst
    inv.cgst_amount = cgst
    inv.igst_amount = igst
    inv.grand_total = round(
        subtotal - inv.discount + sgst + cgst + igst + inv.round_off, 2
    )
    db.commit()
    db.refresh(inv)
    return inv


def get_invoice_with_items(db: Session, invoice_id: int) -> Invoice | None:
    stmt = (
        select(Invoice)
        .options(
            joinedload(Invoice.customer),
            selectinload(Invoice.items),
        )
        .where(Invoice.id == invoice_id)
    )
    return db.scalars(stmt).first()


def list_invoices(
    db: Session, tenant_id: int, status: str | None = None
) -> list[Invoice]:
    stmt = (
        select(Invoice)
        .options(joinedload(Invoice.customer))
        .where(Invoice.tenant_id == tenant_id)
    )
    if status:
        stmt = stmt.where(Invoice.status == status)
    stmt = stmt.order_by(Invoice.issue_date.desc())
    return list(db.scalars(stmt).all())


def create_payment(db: Session, payload: PaymentCreate) -> Payment:
    p = Payment(**payload.model_dump())
    db.add(p)
    inv = db.get(Invoice, payload.invoice_id)
    if inv:
        inv.amount_paid = (inv.amount_paid or 0) + payload.amount
        inv.status = "paid" if inv.amount_paid >= inv.grand_total else "partial"
    db.commit()
    db.refresh(p)
    return p


def list_payments(db: Session, tenant_id: int, invoice_id: int | None = None) -> list[Payment]:
    stmt = select(Payment).where(Payment.tenant_id == tenant_id)
    if invoice_id:
        stmt = stmt.where(Payment.invoice_id == invoice_id)
    stmt = stmt.order_by(Payment.payment_date.desc())
    return list(db.scalars(stmt).all())


def create_lead(db: Session, payload: LeadCreate) -> Lead:
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def list_leads(db: Session, tenant_id: int, status: str | None = None) -> list[Lead]:
    stmt = select(Lead).where(Lead.tenant_id == tenant_id)
    if status:
        stmt = stmt.where(Lead.status == status)
    stmt = stmt.order_by(Lead.id.desc())
    return list(db.scalars(stmt).all())


def update_lead_status(
    db: Session, tenant_id: int, lead_id: int, status: str
) -> Lead | None:
    lead = db.scalars(
        select(Lead).where(Lead.id == lead_id, Lead.tenant_id == tenant_id)
    ).first()
    if not lead:
        return None
    lead.status = status
    db.commit()
    db.refresh(lead)
    return lead


def create_quotation(db: Session, payload: QuotationCreate) -> Quotation:
    quote = Quotation(**payload.model_dump())
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote


def list_quotations(
    db: Session, tenant_id: int, status: str | None = None
) -> list[Quotation]:
    stmt = (
        select(Quotation)
        .options(joinedload(Quotation.customer), joinedload(Quotation.lead))
        .where(Quotation.tenant_id == tenant_id)
    )
    if status:
        stmt = stmt.where(Quotation.status == status)
    stmt = stmt.order_by(Quotation.quote_date.desc())
    return list(db.scalars(stmt).all())


def update_quotation_status(
    db: Session, tenant_id: int, quote_id: int, status: str
) -> Quotation | None:
    quote = db.scalars(
        select(Quotation).where(
            Quotation.id == quote_id, Quotation.tenant_id == tenant_id
        )
    ).first()
    if not quote:
        return None
    quote.status = status
    db.commit()
    db.refresh(quote)
    return quote


def update_sales_order_dispatch(
    db: Session,
    tenant_id: int,
    order_id: int,
    packed: bool | None = None,
    shipped: bool | None = None,
) -> SalesOrder | None:
    order = db.scalars(
        select(SalesOrder).where(
            SalesOrder.id == order_id, SalesOrder.tenant_id == tenant_id
        )
    ).first()
    if not order:
        return None
    if packed is not None:
        order.packed = packed
    if shipped is not None:
        order.shipped = shipped
    db.commit()
    db.refresh(order)
    return order
