from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.sales import (
    CustomerCreate,
    CustomerRead,
    InvoiceCreate,
    InvoiceListRead,
    InvoiceRead,
    InvoiceItemRead,
    LeadCreate,
    LeadRead,
    PaymentCreate,
    PaymentRead,
    QuotationCreate,
    QuotationRead,
    SalesOrderCreate,
    SalesOrderListRead,
    SalesOrderRead,
)
from app.services.sales_service import (
    create_customer,
    create_invoice,
    create_lead,
    create_payment,
    create_quotation,
    create_sales_order,
    get_invoice_with_items,
    list_customers,
    list_invoices,
    list_leads,
    list_payments,
    list_quotations,
    list_sales_orders,
    update_lead_status,
    update_quotation_status,
    update_sales_order_dispatch,
)

router = APIRouter(prefix="/sales", tags=["sales"])

MODULE = "sales"


@router.post("/customers", response_model=CustomerRead)
def create_customer_endpoint(
    payload: CustomerCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_customer(db, payload)


@router.get("/customers", response_model=list[CustomerRead])
def list_customers_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_customers(db, tenant_id)


@router.post("/leads", response_model=LeadRead)
def create_lead_endpoint(
    payload: LeadCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_lead(db, payload)


@router.get("/leads", response_model=list[LeadRead])
def list_leads_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_leads(db, tenant_id, status)


@router.patch("/leads/{lead_id}/status", response_model=LeadRead)
def update_lead_status_endpoint(
    lead_id: int,
    status: str = Query(...),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    lead = update_lead_status(db, tenant_id, lead_id, status)
    if not lead:
        raise HTTPException(404, "Lead not found")
    return lead


@router.post("/quotations", response_model=QuotationRead)
def create_quotation_endpoint(
    payload: QuotationCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_quotation(db, payload)


@router.get("/quotations", response_model=list[QuotationRead])
def list_quotations_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_quotations(db, tenant_id, status)


@router.patch("/quotations/{quote_id}/status", response_model=QuotationRead)
def update_quotation_status_endpoint(
    quote_id: int,
    status: str = Query(...),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    quote = update_quotation_status(db, tenant_id, quote_id, status)
    if not quote:
        raise HTTPException(404, "Quotation not found")
    return quote


@router.post("/sales-orders", response_model=SalesOrderRead)
def create_sales_order_endpoint(
    payload: SalesOrderCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_sales_order(db, payload)


@router.get("/sales-orders", response_model=list[SalesOrderListRead])
def list_sales_orders_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    orders = list_sales_orders(db, tenant_id, status)
    return [
        SalesOrderListRead(
            **SalesOrderRead.model_validate(o).model_dump(),
            customer_name=o.customer.name if o.customer else None,
        )
        for o in orders
    ]


@router.patch("/sales-orders/{order_id}/status", response_model=SalesOrderRead)
def update_sales_order_status_endpoint(
    order_id: int,
    status: str = Query(...),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    from app.services.sales_service import update_sales_order_status

    order = update_sales_order_status(db, tenant_id, order_id, status)
    if not order:
        raise HTTPException(404, "Sales order not found")
    return order


@router.patch("/sales-orders/{order_id}/dispatch", response_model=SalesOrderRead)
def update_sales_order_dispatch_endpoint(
    order_id: int,
    packed: bool | None = Query(None),
    shipped: bool | None = Query(None),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    order = update_sales_order_dispatch(db, tenant_id, order_id, packed, shipped)
    if not order:
        raise HTTPException(404, "Sales order not found")
    return order


@router.get("/sales-orders/{order_id}")
def get_sales_order_detail_endpoint(
    order_id: int,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    from app.services.sales_service import get_sales_order_with_items

    order = get_sales_order_with_items(db, tenant_id, order_id)
    if not order:
        raise HTTPException(404, "Sales order not found")
    data = SalesOrderRead.model_validate(order)
    cust = CustomerRead.model_validate(order.customer) if order.customer else None
    return {"order": data, "customer": cust}


@router.post("/invoices", response_model=InvoiceRead)
def create_invoice_endpoint(
    payload: InvoiceCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_invoice(db, payload)


@router.get("/invoices", response_model=list[InvoiceListRead])
def list_invoices_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    invs = list_invoices(db, tenant_id, status)
    return [
        InvoiceListRead(
            **InvoiceRead.model_validate(i).model_dump(),
            customer_name=i.customer.name if i.customer else None,
        )
        for i in invs
    ]


@router.get("/invoices/{invoice_id}")
def get_invoice_detail_endpoint(
    invoice_id: int,
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    inv = get_invoice_with_items(db, invoice_id)
    if not inv or inv.tenant_id != tenant_id:
        raise HTTPException(404, "Invoice not found")
    data = InvoiceRead.model_validate(inv)
    items = [InvoiceItemRead.model_validate(i) for i in inv.items]
    cust = CustomerRead.model_validate(inv.customer) if inv.customer else None
    return {"found": True, "invoice": data, "items": items, "customer": cust}


@router.post("/payments", response_model=PaymentRead)
def create_payment_endpoint(
    payload: PaymentCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_payment(db, payload)


@router.get("/payments", response_model=list[PaymentRead])
def list_payments_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    invoice_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_payments(db, tenant_id, invoice_id)
