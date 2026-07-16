from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.procurement import (
    GoodsReceipt,
    GoodsReceiptLine,
    MaterialRequest,
    MaterialRequestLine,
    PurchaseOrder,
    PurchaseOrderLine,
    SupplierPayment,
    RFQ,
    VendorQuotation,
    VendorBill,
)
from app.models.inventory import Supplier
from app.schemas.procurement import (
    GoodsReceiptCreate,
    MaterialRequestCreate,
    PurchaseOrderCreate,
    SupplierPaymentCreate,
)
from app.schemas.inventory import StockMovementCreate
from app.services.inventory_service import record_stock_movement


def update_purchase_order_status(
    db: Session, po_id: int, tenant_id: int, status: str
) -> PurchaseOrder | None:
    po = db.scalars(
        select(PurchaseOrder).where(
            PurchaseOrder.id == po_id, PurchaseOrder.tenant_id == tenant_id
        )
    ).first()
    if not po:
        return None
    po.status = status
    db.commit()
    db.refresh(po)
    return po


def create_purchase_order(db: Session, payload: PurchaseOrderCreate) -> PurchaseOrder:
    po = PurchaseOrder(
        tenant_id=payload.tenant_id,
        supplier_id=payload.supplier_id,
        po_number=payload.po_number,
        order_date=payload.order_date,
        expected_date=payload.expected_date,
        status=payload.status,
        total_amount=payload.total_amount,
        notes=payload.notes,
    )
    db.add(po)
    db.flush()
    total = 0.0
    for line in payload.line_items:
        lt = (line.unit_price or 0) * line.quantity
        pol = PurchaseOrderLine(
            purchase_order_id=po.id,
            item_id=line.item_id,
            quantity=line.quantity,
            unit_price=line.unit_price,
            line_total=lt,
        )
        db.add(pol)
        total += lt
    if total:
        po.total_amount = total
    db.commit()
    db.refresh(po)
    return po


def list_purchase_orders(db: Session, tenant_id: int) -> list[PurchaseOrder]:
    stmt = (
        select(PurchaseOrder)
        .options(joinedload(PurchaseOrder.supplier))
        .where(PurchaseOrder.tenant_id == tenant_id)
        .order_by(PurchaseOrder.order_date.desc())
    )
    return list(db.scalars(stmt).all())


def create_material_request(db: Session, payload: MaterialRequestCreate) -> MaterialRequest:
    import random
    from datetime import date, timedelta
    
    mr = MaterialRequest(
        tenant_id=payload.tenant_id,
        mr_number=payload.mr_number,
        request_date=payload.request_date,
        required_date=payload.required_date,
        requested_by=payload.requested_by,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(mr)
    db.flush()
    for line in payload.line_items:
        mrl = MaterialRequestLine(
            material_request_id=mr.id,
            item_id=line.item_id,
            quantity=line.quantity,
            notes=line.notes,
        )
        db.add(mrl)
    db.flush()

    # Create corresponding RFQ
    rfq_number = mr.mr_number.replace("MR", "RFQ")
    rfq = RFQ(
        tenant_id=mr.tenant_id,
        rfq_number=rfq_number,
        material_request_id=mr.id,
        due_date=date.today() + timedelta(days=7),
        status="open",
    )
    db.add(rfq)
    db.flush()
    
    # Create Vendor Quotations
    suppliers = list(db.scalars(select(Supplier).where(Supplier.tenant_id == mr.tenant_id)).all())
    if suppliers:
        for s in suppliers[:3]:
            price = float(random.choice([12000, 14000, 15000, 18000]))
            delivery = random.choice([3, 5, 7])
            rating = random.choice([4.2, 4.5, 4.8])
            vq = VendorQuotation(
                tenant_id=mr.tenant_id,
                rfq_id=rfq.id,
                supplier_id=s.id,
                price=price,
                delivery_days=delivery,
                gst_pct=18.0,
                warranty="1 Year",
                rating=rating,
                status="submitted",
            )
            db.add(vq)

    db.commit()
    db.refresh(mr)
    return mr


def list_material_requests(db: Session, tenant_id: int) -> list[MaterialRequest]:
    stmt = select(MaterialRequest).where(MaterialRequest.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_goods_receipt(db: Session, payload: GoodsReceiptCreate) -> GoodsReceipt:
    gr = GoodsReceipt(
        tenant_id=payload.tenant_id,
        purchase_order_id=payload.purchase_order_id,
        grn_number=payload.grn_number,
        receipt_date=payload.receipt_date,
        warehouse_id=payload.warehouse_id,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(gr)
    db.flush()
    for line in payload.line_items:
        grl = GoodsReceiptLine(
            goods_receipt_id=gr.id,
            item_id=line.item_id,
            quantity_received=line.quantity_received,
            quantity_rejected=line.quantity_rejected,
        )
        db.add(grl)
        received_qty = int(line.quantity_received or 0)
        if received_qty > 0:
            record_stock_movement(
                db,
                StockMovementCreate(
                    tenant_id=payload.tenant_id,
                    warehouse_id=payload.warehouse_id,
                    item_id=line.item_id,
                    quantity=received_qty,
                    movement_type="in",
                ),
            )
    if payload.purchase_order_id:
        po = db.get(PurchaseOrder, payload.purchase_order_id)
        if po and po.tenant_id == payload.tenant_id:
            po.status = "received"
    db.commit()
    db.refresh(gr)
    # Create corresponding VendorBill
    from datetime import date, timedelta
    po = db.get(PurchaseOrder, payload.purchase_order_id) if payload.purchase_order_id else None
    supplier_id = po.supplier_id if po else 1
    amount = float(po.total_amount) if po and po.total_amount else 5000.0
    gst_amount = float(po.gst_amount) if po and po.gst_amount else 900.0
    
    bill_number = gr.grn_number.replace("GRN", "BILL")
    due_date = date.today() + timedelta(days=30)
    
    bill = VendorBill(
        tenant_id=gr.tenant_id,
        bill_number=bill_number,
        supplier_id=supplier_id,
        purchase_order_id=gr.purchase_order_id,
        goods_receipt_id=gr.id,
        bill_date=gr.receipt_date,
        due_date=due_date,
        amount=amount,
        gst_amount=gst_amount,
        status="pending",
    )
    db.add(bill)
    db.commit()

    return gr


def list_goods_receipts(db: Session, tenant_id: int) -> list[GoodsReceipt]:
    stmt = select(GoodsReceipt).where(GoodsReceipt.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())


def create_supplier_payment(db: Session, payload: SupplierPaymentCreate) -> SupplierPayment:
    sp = SupplierPayment(**payload.model_dump())
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return sp


def list_supplier_payments(db: Session, tenant_id: int) -> list[SupplierPayment]:
    stmt = select(SupplierPayment).where(SupplierPayment.tenant_id == tenant_id)
    return list(db.scalars(stmt).all())
