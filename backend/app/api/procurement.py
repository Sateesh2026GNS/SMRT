from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.inventory import SupplierRead
from app.schemas.procurement import (
    GoodsReceiptCreate,
    GoodsReceiptRead,
    MaterialRequestCreate,
    MaterialRequestRead,
    PurchaseOrderCreate,
    PurchaseOrderListRead,
    PurchaseOrderRead,
    SupplierPaymentCreate,
    SupplierPaymentRead,
)
from app.services.inventory_service import list_suppliers, update_supplier_approval
from app.services.procurement_service import (
    create_goods_receipt,
    create_material_request,
    create_purchase_order,
    create_supplier_payment,
    list_goods_receipts,
    list_material_requests,
    list_purchase_orders,
    list_supplier_payments,
    update_purchase_order_status,
)

router = APIRouter(prefix="/procurement", tags=["procurement"])

MODULE = "procurement"


@router.post("/purchase-orders", response_model=PurchaseOrderRead)
def create_purchase_order_endpoint(
    payload: PurchaseOrderCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> PurchaseOrderRead:
    payload.tenant_id = user.tenant_id
    return create_purchase_order(db, payload)


@router.get("/purchase-orders", response_model=list[PurchaseOrderListRead])
def list_purchase_orders_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[PurchaseOrderListRead]:
    orders = list_purchase_orders(db, tenant_id)
    return [
        PurchaseOrderListRead(
            **PurchaseOrderRead.model_validate(o).model_dump(),
            supplier_name=o.supplier.name if o.supplier else None,
        )
        for o in orders
    ]


@router.patch("/purchase-orders/{po_id}/status", response_model=PurchaseOrderRead)
def update_purchase_order_status_endpoint(
    po_id: int,
    status: str = Query(..., description="e.g. draft, approved, received, cancelled"),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> PurchaseOrderRead:
    po = update_purchase_order_status(db, po_id, tenant_id, status)
    if not po:
        raise HTTPException(404, "Purchase order not found")
    return po


@router.get("/vendors", response_model=list[SupplierRead])
def list_vendors_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[SupplierRead]:
    return list_suppliers(db, tenant_id)


@router.patch("/vendors/{vendor_id}/approval", response_model=SupplierRead)
def update_vendor_approval_endpoint(
    vendor_id: int,
    status: str = Query(..., description="approved or rejected"),
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
) -> SupplierRead:
    if status not in ("approved", "rejected", "pending"):
        raise HTTPException(400, "Invalid approval status")
    vendor = update_supplier_approval(db, tenant_id, vendor_id, status)
    if not vendor:
        raise HTTPException(404, "Vendor not found")
    return vendor


@router.post("/material-requests", response_model=MaterialRequestRead)
def create_material_request_endpoint(
    payload: MaterialRequestCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> MaterialRequestRead:
    payload.tenant_id = user.tenant_id
    return create_material_request(db, payload)


@router.get("/material-requests", response_model=list[MaterialRequestRead])
def list_material_requests_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[MaterialRequestRead]:
    return list_material_requests(db, tenant_id)


@router.post("/goods-receipt", response_model=GoodsReceiptRead)
def create_goods_receipt_endpoint(
    payload: GoodsReceiptCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> GoodsReceiptRead:
    payload.tenant_id = user.tenant_id
    return create_goods_receipt(db, payload)


@router.get("/goods-receipt", response_model=list[GoodsReceiptRead])
def list_goods_receipts_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[GoodsReceiptRead]:
    return list_goods_receipts(db, tenant_id)


@router.post("/supplier-payments", response_model=SupplierPaymentRead)
def create_supplier_payment_endpoint(
    payload: SupplierPaymentCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> SupplierPaymentRead:
    payload.tenant_id = user.tenant_id
    return create_supplier_payment(db, payload)


@router.get("/supplier-payments", response_model=list[SupplierPaymentRead])
def list_supplier_payments_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
) -> list[SupplierPaymentRead]:
    return list_supplier_payments(db, tenant_id)
