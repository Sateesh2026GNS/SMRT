"""End-to-end manufacturing workflow orchestration.

Connects Sales → MRP → Procurement → Inventory → Production → QC → FG → Dispatch
so each user action posts related modules in one transactional flow.
"""

from __future__ import annotations

import math
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.bom import BillOfMaterial
from app.models.inventory import InventoryItem, Warehouse
from app.models.product import Product
from app.models.production import ProductionOrder, WorkOrder
from app.models.quality import QualityInspection
from app.models.sales import SalesOrder, SalesOrderLine
from app.schemas.inventory import StockMovementCreate
from app.schemas.procurement import MaterialRequestCreate, MaterialRequestLineCreate
from app.schemas.work_order import WorkOrderActionResponse
from app.services.inventory_service import (
    find_or_create_finished_good_for_product,
    get_default_warehouse,
    get_total_stock,
    record_stock_movement,
)
from app.services.procurement_service import create_material_request


def _qty_int(value: float) -> int:
    """Stock levels are integer; round up fractional BOM requirements."""
    return max(0, int(math.ceil(float(value or 0))))


def find_or_create_inventory_item_for_product(
    db: Session,
    tenant_id: int,
    product: Product,
    *,
    item_type: str = "raw_material",
) -> InventoryItem:
    item = db.scalars(
        select(InventoryItem).where(
            InventoryItem.tenant_id == tenant_id,
            InventoryItem.sku == product.sku,
        )
    ).first()
    if item:
        if item.item_type != item_type and item_type == "finished_good":
            item.item_type = "finished_good"
        return item
    item = InventoryItem(
        tenant_id=tenant_id,
        sku=product.sku,
        name=product.name,
        description=product.description,
        unit=getattr(product, "unit", None) or "pcs",
        unit_cost=float(product.unit_cost) if product.unit_cost else None,
        item_type=item_type,
        is_active=True,
    )
    db.add(item)
    db.flush()
    return item


def get_bom_requirements(
    db: Session,
    tenant_id: int,
    product_id: int,
    quantity: float,
) -> list[dict[str, Any]]:
    """Explode BOM for a finished product into inventory requirements."""
    bom_rows = list(
        db.scalars(
            select(BillOfMaterial).where(
                BillOfMaterial.tenant_id == tenant_id,
                BillOfMaterial.product_id == product_id,
            )
        ).all()
    )
    requirements: list[dict[str, Any]] = []
    for row in bom_rows:
        component = db.get(Product, row.component_product_id)
        if not component:
            continue
        item = find_or_create_inventory_item_for_product(
            db, tenant_id, component, item_type="raw_material"
        )
        required = float(row.quantity) * float(quantity or 0)
        available = float(get_total_stock(db, item.id))
        shortage = max(required - available, 0.0)
        requirements.append(
            {
                "component_product_id": component.id,
                "component_name": component.name,
                "sku": component.sku,
                "item_id": item.id,
                "unit": row.unit,
                "required_qty": round(required, 4),
                "available_qty": available,
                "shortage_qty": round(shortage, 4),
                "enough": shortage <= 0,
            }
        )
    return requirements


def run_mrp(
    db: Session,
    tenant_id: int,
    product_id: int,
    quantity: float,
    *,
    create_purchase_request: bool = True,
    requested_by: str | None = None,
    reference: str | None = None,
) -> dict[str, Any]:
    """Material Requirement Planning: check stock; optionally open a material request."""
    product = db.scalars(
        select(Product).where(Product.id == product_id, Product.tenant_id == tenant_id)
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    requirements = get_bom_requirements(db, tenant_id, product_id, quantity)
    shortages = [r for r in requirements if not r["enough"]]
    material_request_id = None
    mr_number = None

    if create_purchase_request and shortages:
        ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        mr_number = f"MR-MRP-{ts}"
        lines = [
            MaterialRequestLineCreate(
                item_id=s["item_id"],
                quantity=max(1.0, float(s["shortage_qty"])),
                notes=f"MRP shortage for {product.sku} x {quantity}",
            )
            for s in shortages
        ]
        mr = create_material_request(
            db,
            MaterialRequestCreate(
                tenant_id=tenant_id,
                mr_number=mr_number,
                request_date=date.today(),
                required_date=None,
                requested_by=requested_by or "MRP",
                status="pending",
                notes=f"Auto MRP for {product.name}"
                + (f" / {reference}" if reference else ""),
                line_items=lines,
            ),
        )
        material_request_id = mr.id

    return {
        "product_id": product_id,
        "product_name": product.name,
        "sku": product.sku,
        "quantity": float(quantity),
        "requirements": requirements,
        "enough_stock": len(shortages) == 0,
        "shortage_count": len(shortages),
        "material_request_id": material_request_id,
        "material_request_number": mr_number,
        "action": "produce" if len(shortages) == 0 else "purchase",
    }


def issue_materials_for_work_order(
    db: Session,
    tenant_id: int,
    work_order_id: int,
    *,
    warehouse_id: int | None = None,
    force: bool = False,
) -> dict[str, Any]:
    """Consume BOM materials for a work order (inventory OUT + stock ledger)."""
    wo = db.scalars(
        select(WorkOrder).where(
            WorkOrder.id == work_order_id, WorkOrder.tenant_id == tenant_id
        )
    ).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    if wo.status in {"completed", "closed", "done"}:
        raise HTTPException(status_code=400, detail="Work order already completed")
    if getattr(wo, "materials_issued", False) and not force:
        return {
            "success": True,
            "already_issued": True,
            "work_order_id": wo.id,
            "movements": [],
            "message": "Materials already issued",
        }

    po = db.get(ProductionOrder, wo.production_order_id)
    if not po:
        raise HTTPException(status_code=400, detail="Production order missing")

    warehouse = None
    if warehouse_id:
        warehouse = db.get(Warehouse, warehouse_id)
    if not warehouse:
        warehouse = get_default_warehouse(db, tenant_id)
    if not warehouse:
        raise HTTPException(
            status_code=400,
            detail="No warehouse found. Create a warehouse before issuing materials.",
        )

    requirements = get_bom_requirements(
        db, tenant_id, po.product_id, float(wo.planned_quantity or 0)
    )
    if not requirements:
        wo.materials_issued = True
        db.commit()
        db.refresh(wo)
        return {
            "success": True,
            "already_issued": False,
            "work_order_id": wo.id,
            "movements": [],
            "message": "No BOM components — nothing to issue",
        }

    shortages = [r for r in requirements if not r["enough"]]
    if shortages and not force:
        names = ", ".join(f"{s['component_name']} (need {s['shortage_qty']})" for s in shortages[:5])
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock to issue materials: {names}. Run MRP / receive GRN first.",
        )

    movements = []
    for req in requirements:
        qty = _qty_int(req["required_qty"])
        if qty <= 0:
            continue
        mov = record_stock_movement(
            db,
            StockMovementCreate(
                tenant_id=tenant_id,
                warehouse_id=warehouse.id,
                item_id=req["item_id"],
                quantity=qty,
                movement_type="out",
            ),
            commit=False,
        )
        movements.append(
            {
                "item_id": req["item_id"],
                "sku": req["sku"],
                "name": req["component_name"],
                "quantity": qty,
                "unit": req["unit"],
                "movement_id": mov.id,
            }
        )

    wo.materials_issued = True
    if wo.status in {"draft", "planned", "pending", "released"}:
        wo.status = "material_ready"
    db.commit()
    db.refresh(wo)
    return {
        "success": True,
        "already_issued": False,
        "work_order_id": wo.id,
        "warehouse_id": warehouse.id,
        "movements": movements,
        "message": f"Issued {len(movements)} material line(s)",
    }


def _ensure_final_qc_pass(
    db: Session,
    tenant_id: int,
    wo: WorkOrder,
    po: ProductionOrder,
    product: Product | None,
    *,
    qty: float,
    auto_pass: bool = True,
) -> QualityInspection:
    """Require a final QC pass before FG posting. Creates one if auto_pass."""
    existing = db.scalars(
        select(QualityInspection).where(
            QualityInspection.tenant_id == tenant_id,
            QualityInspection.work_order_number == wo.work_order_number,
            QualityInspection.inspection_type == "final",
            QualityInspection.result == "pass",
        )
    ).first()
    if existing:
        return existing

    if not auto_pass:
        raise HTTPException(
            status_code=400,
            detail="Final QC pass required before completing work order / posting finished goods.",
        )

    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    qi = QualityInspection(
        tenant_id=tenant_id,
        inspection_number=f"QC-WO-{ts}",
        inspection_date=date.today(),
        product_id=po.product_id,
        result="pass",
        inspector="System",
        notes=f"Auto final QC on WO complete {wo.work_order_number}",
        inspection_type="final",
        status="completed",
        work_order_number=wo.work_order_number,
        product_name=product.name if product else None,
        quantity=qty,
        sales_order_number=po.sales_order_number,
        approval="approved",
    )
    db.add(qi)
    db.flush()
    return qi


def receive_finished_goods(
    db: Session,
    tenant_id: int,
    product: Product,
    quantity: float,
    *,
    warehouse_id: int | None = None,
    reference: str | None = None,
    commit: bool = True,
) -> dict[str, Any]:
    """Post finished goods into inventory (stock IN + ledger)."""
    qty = _qty_int(quantity)
    if qty <= 0:
        return {"posted": False, "quantity": 0, "message": "Nothing to post"}

    warehouse = None
    if warehouse_id:
        warehouse = db.get(Warehouse, warehouse_id)
    if not warehouse:
        warehouse = get_default_warehouse(db, tenant_id)
    if not warehouse:
        raise HTTPException(
            status_code=400,
            detail="No warehouse found. Create a warehouse before posting finished goods.",
        )

    item = find_or_create_finished_good_for_product(db, tenant_id, product)
    if item.item_type != "finished_good":
        item.item_type = "finished_good"

    mov = record_stock_movement(
        db,
        StockMovementCreate(
            tenant_id=tenant_id,
            warehouse_id=warehouse.id,
            item_id=item.id,
            quantity=qty,
            movement_type="in",
        ),
        commit=False,
    )
    if commit:
        db.commit()
    else:
        db.flush()

    return {
        "posted": True,
        "quantity": qty,
        "item_id": item.id,
        "sku": item.sku,
        "warehouse_id": warehouse.id,
        "movement_id": mov.id,
        "reference": reference,
    }


def complete_work_order_integrated(
    db: Session,
    tenant_id: int,
    work_order_id: int,
    *,
    auto_issue_materials: bool = True,
    auto_qc_pass: bool = True,
    user_id: int | None = None,
) -> WorkOrderActionResponse:
    """
    Complete WO with automatic cross-module updates:
    materials → QC → FG inventory → production status → audit trail steps.
    """
    from app.services.work_order_service import _to_list_read

    wo = db.scalars(
        select(WorkOrder).where(
            WorkOrder.id == work_order_id, WorkOrder.tenant_id == tenant_id
        )
    ).first()
    if not wo:
        return WorkOrderActionResponse(success=False, message="Work order not found")
    if wo.status in {"completed", "closed", "done"}:
        return WorkOrderActionResponse(
            success=True,
            work_order=_to_list_read(db, tenant_id, wo),
            message="Work order already completed",
            steps=["Already completed"],
        )

    po = db.get(ProductionOrder, wo.production_order_id)
    if not po:
        return WorkOrderActionResponse(success=False, message="Production order missing")
    product = db.get(Product, po.product_id)

    steps: list[str] = []
    try:
        if auto_issue_materials and not getattr(wo, "materials_issued", False):
            issue_result = issue_materials_for_work_order(db, tenant_id, wo.id)
            steps.append(issue_result.get("message") or "Materials issued")
            db.refresh(wo)

        qty = float(wo.actual_quantity or wo.planned_quantity or 0)
        qi = _ensure_final_qc_pass(
            db, tenant_id, wo, po, product, qty=qty, auto_pass=auto_qc_pass
        )
        steps.append(f"Quality inspection passed ({qi.inspection_number})")

        if product:
            fg = receive_finished_goods(
                db,
                tenant_id,
                product,
                qty,
                reference=wo.work_order_number,
                commit=False,
            )
            if fg.get("posted"):
                steps.append(
                    f"Finished goods posted: {fg['sku']} +{fg['quantity']} to warehouse #{fg['warehouse_id']}"
                )
            else:
                steps.append("Finished goods: nothing to post")
        else:
            steps.append("Finished goods skipped (product missing)")

        wo.actual_quantity = qty
        wo.status = "completed"
        wo.planned_end = datetime.now(timezone.utc)
        steps.append("Work order closed")

        # Roll up production order if all WOs completed
        sibling_wos = list(
            db.scalars(
                select(WorkOrder).where(WorkOrder.production_order_id == po.id)
            ).all()
        )
        if sibling_wos and all(
            w.status in {"completed", "closed", "done"} or w.id == wo.id
            for w in sibling_wos
        ):
            po.status = "completed"
            steps.append(f"Production order {po.order_number} completed")

        try:
            from app.services.audit_service import log_audit

            log_audit(
                db,
                tenant_id=tenant_id,
                user_id=user_id,
                action="work_order.complete",
                resource="work_orders",
                resource_id=wo.id,
                details="; ".join(steps),
            )
        except Exception:
            # Audit must not block completion
            pass

        db.commit()
        db.refresh(wo)
    except HTTPException as exc:
        db.rollback()
        return WorkOrderActionResponse(
            success=False,
            message=str(exc.detail),
            steps=steps,
        )
    except Exception as exc:
        db.rollback()
        return WorkOrderActionResponse(
            success=False,
            message=f"Completion failed: {exc}",
            steps=steps,
        )

    _emit_wo_completed(db, tenant_id, wo)

    return WorkOrderActionResponse(
        success=True,
        steps=steps,
        work_order=_to_list_read(db, tenant_id, wo),
        message="Work order completed — inventory, QC, and production updated",
    )


def _emit_wo_completed(db, tenant_id: int, wo) -> None:
    try:
        from app.services.alert_event_service import emit_alert

        emit_alert(
            db,
            tenant_id=tenant_id,
            alert_type="work_order_completed",
            title=f"Work order completed: {wo.work_order_number}",
            message=f"WO {wo.work_order_number} completed — FG received",
            severity="medium",
            link=f"/production/work-orders?id={wo.id}",
            reference_type="work_order",
            reference_id=wo.id,
            created_by="Production",
        )
    except Exception:
        pass


# Patch: emit after successful complete — inject into return path above


def confirm_sales_order_workflow(
    db: Session,
    tenant_id: int,
    sales_order_id: int,
    *,
    create_production: bool = True,
    run_mrp_and_pr: bool = True,
    requested_by: str | None = None,
) -> dict[str, Any]:
    """
    Confirm SO → explode lines → MRP → optional production orders + purchase requests.
    """
    so = db.scalars(
        select(SalesOrder).where(
            SalesOrder.id == sales_order_id, SalesOrder.tenant_id == tenant_id
        )
    ).first()
    if not so:
        raise HTTPException(status_code=404, detail="Sales order not found")

    lines = list(
        db.scalars(
            select(SalesOrderLine).where(SalesOrderLine.sales_order_id == so.id)
        ).all()
    )
    if not lines:
        # Header-only SO: cannot plan manufacturing without product lines
        so.status = "confirmed"
        db.commit()
        db.refresh(so)
        return {
            "sales_order_id": so.id,
            "order_number": so.order_number,
            "status": so.status,
            "warning": "Sales order has no line items — add products before MRP/production.",
            "mrp_results": [],
            "production_orders": [],
        }

    mrp_results = []
    production_orders = []
    for line in lines:
        if not line.product_id:
            continue
        mrp = run_mrp(
            db,
            tenant_id,
            line.product_id,
            float(line.quantity),
            create_purchase_request=run_mrp_and_pr,
            requested_by=requested_by or "Sales Order Confirm",
            reference=so.order_number,
        )
        mrp_results.append(mrp)

        if create_production:
            product = db.get(Product, line.product_id)
            ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
            order_number = f"PO-{so.order_number}-{line.id}-{ts[-4:]}"
            existing = db.scalars(
                select(ProductionOrder).where(
                    ProductionOrder.tenant_id == tenant_id,
                    ProductionOrder.order_number == order_number,
                )
            ).first()
            if existing:
                production_orders.append(
                    {"id": existing.id, "order_number": existing.order_number}
                )
                continue
            po = ProductionOrder(
                tenant_id=tenant_id,
                product_id=line.product_id,
                order_number=order_number,
                planned_quantity=float(line.quantity),
                status="planned",
                priority="medium",
                sales_order_number=so.order_number,
                sales_order_id=so.id,
                customer_name=None,
            )
            db.add(po)
            db.flush()
            production_orders.append(
                {
                    "id": po.id,
                    "order_number": po.order_number,
                    "product": product.name if product else None,
                    "quantity": float(line.quantity),
                    "enough_stock": mrp["enough_stock"],
                }
            )

    so.status = "confirmed"
    db.commit()
    db.refresh(so)
    return {
        "sales_order_id": so.id,
        "order_number": so.order_number,
        "status": so.status,
        "mrp_results": mrp_results,
        "production_orders": production_orders,
    }


def ship_sales_order_stock_out(
    db: Session,
    tenant_id: int,
    sales_order_id: int,
    *,
    warehouse_id: int | None = None,
) -> dict[str, Any]:
    """On dispatch/ship: deduct finished goods for each SO line."""
    so = db.scalars(
        select(SalesOrder).where(
            SalesOrder.id == sales_order_id, SalesOrder.tenant_id == tenant_id
        )
    ).first()
    if not so:
        raise HTTPException(status_code=404, detail="Sales order not found")

    warehouse = None
    if warehouse_id:
        warehouse = db.get(Warehouse, warehouse_id)
    if not warehouse:
        warehouse = get_default_warehouse(db, tenant_id)
    if not warehouse:
        raise HTTPException(status_code=400, detail="No warehouse for stock-out")

    lines = list(
        db.scalars(
            select(SalesOrderLine).where(SalesOrderLine.sales_order_id == so.id)
        ).all()
    )
    movements = []
    if not lines:
        so.shipped = True
        so.status = "shipped"
        db.commit()
        return {
            "sales_order_id": so.id,
            "shipped": True,
            "warning": "No line items — flags updated without stock movement",
            "movements": [],
        }

    for line in lines:
        if not line.product_id:
            continue
        product = db.get(Product, line.product_id)
        if not product:
            continue
        item = find_or_create_finished_good_for_product(db, tenant_id, product)
        qty = _qty_int(line.quantity)
        available = get_total_stock(db, item.id)
        if available < qty:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient finished goods for {product.sku}: "
                    f"need {qty}, available {available}"
                ),
            )
        mov = record_stock_movement(
            db,
            StockMovementCreate(
                tenant_id=tenant_id,
                warehouse_id=warehouse.id,
                item_id=item.id,
                quantity=qty,
                movement_type="out",
            ),
            commit=False,
        )
        movements.append(
            {
                "sku": product.sku,
                "quantity": qty,
                "movement_id": mov.id,
            }
        )

    so.shipped = True
    so.packed = True
    so.status = "shipped"
    db.commit()
    try:
        from app.services.alert_event_service import emit_alert

        emit_alert(
            db,
            tenant_id=tenant_id,
            alert_type="dispatch_completed",
            title=f"Dispatch completed: {so.order_number}",
            message=f"Sales order {so.order_number} shipped — {len(movements)} FG movement(s)",
            severity="medium",
            link="/sales/dispatch",
            reference_type="sales_order",
            reference_id=so.id,
            created_by="Dispatch",
        )
    except Exception:
        pass
    return {
        "sales_order_id": so.id,
        "order_number": so.order_number,
        "shipped": True,
        "movements": movements,
        "message": f"Shipped — {len(movements)} FG stock-out movement(s)",
    }
