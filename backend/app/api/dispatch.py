from fastapi import APIRouter, Depends
<<<<<<< HEAD
from sqlalchemy import func, select
=======
>>>>>>> 42502626 (first commit)
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import tenant_scope
<<<<<<< HEAD
from app.models.sales import Customer, SalesOrder

router = APIRouter(prefix="/dispatch", tags=["Dispatch & Logistics"])
=======
from app.schemas.sales_extended import DispatchListRead, DispatchSummaryRead
from app.services.sales_extended_service import get_dispatch_summary, list_dispatch_enriched

router = APIRouter(prefix="/dispatch", tags=["dispatch"])
>>>>>>> 42502626 (first commit)

MODULE = "sales"


<<<<<<< HEAD
def _order_rows(db: Session, tenant_id: int, only_shipped: bool = False):
    stmt = (
        select(SalesOrder, Customer.name)
        .join(Customer, SalesOrder.customer_id == Customer.id)
        .where(SalesOrder.tenant_id == tenant_id)
    )
    if only_shipped:
        stmt = stmt.where(SalesOrder.shipped.is_(True))
    stmt = stmt.order_by(SalesOrder.order_date.desc())
    return db.execute(stmt).all()


@router.get("/dispatch-orders")
def get_dispatch_orders(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Sales orders that are packed and awaiting / undergoing dispatch."""
    rows = db.execute(
        select(SalesOrder, Customer.name)
        .join(Customer, SalesOrder.customer_id == Customer.id)
        .where(SalesOrder.tenant_id == tenant_id, SalesOrder.packed.is_(True))
        .order_by(SalesOrder.order_date.desc())
    ).all()
    return [
        {
            "id": so.id,
            "order_number": so.order_number,
            "customer": cust,
            "order_date": so.order_date.isoformat() if so.order_date else None,
            "total_amount": float(so.total_amount or 0),
            "packed": so.packed,
            "shipped": so.shipped,
            "status": "shipped" if so.shipped else "ready_to_dispatch",
        }
        for so, cust in rows
    ]


@router.get("/shipment-tracking")
def get_shipment_tracking(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Shipped sales orders with reference numbers used as tracking ids."""
    rows = _order_rows(db, tenant_id, only_shipped=True)
    return [
        {
            "id": so.id,
            "order_number": so.order_number,
            "tracking_reference": so.reference_number or f"SHIP-{so.id:05d}",
            "customer": cust,
            "shipped": so.shipped,
            "order_date": so.order_date.isoformat() if so.order_date else None,
        }
        for so, cust in rows
    ]


@router.get("/delivery-status")
def get_delivery_status(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Aggregate delivery pipeline counts for the tenant."""
    base = select(func.count()).select_from(SalesOrder).where(
        SalesOrder.tenant_id == tenant_id
    )
    total = db.scalar(base) or 0
    packed = db.scalar(base.where(SalesOrder.packed.is_(True))) or 0
    shipped = db.scalar(base.where(SalesOrder.shipped.is_(True))) or 0
    return {
        "total_orders": int(total),
        "pending": int(total - packed),
        "packed": int(packed),
        "shipped": int(shipped),
        "in_transit": int(packed - shipped if packed > shipped else 0),
    }


@router.get("/transport-details")
def get_transport_details(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Transport manifest derived from shipped orders grouped by customer."""
    rows = _order_rows(db, tenant_id, only_shipped=True)
    by_customer: dict[str, dict] = {}
    for so, cust in rows:
        entry = by_customer.setdefault(
            cust, {"customer": cust, "shipments": 0, "total_value": 0.0}
        )
        entry["shipments"] += 1
        entry["total_value"] += float(so.total_amount or 0)
    return list(by_customer.values())
=======
@router.get("/summary", response_model=DispatchSummaryRead)
def dispatch_summary(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db)
):
    return get_dispatch_summary(db, tenant_id)


@router.get("/enriched", response_model=list[DispatchListRead])
def dispatch_enriched(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db)
):
    return list_dispatch_enriched(db, tenant_id)
>>>>>>> 42502626 (first commit)
