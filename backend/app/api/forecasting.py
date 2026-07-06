from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.models.inventory import InventoryItem, StockLevel
from app.models.production import DailyProductionReport
from app.models.sales import SalesOrder

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])

MODULE = "analytics"


@router.get("/production-forecast")
def get_production_forecast(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Naive next-period production projection from the daily report history."""
    avg_daily, days = db.execute(
        select(
            func.coalesce(func.avg(DailyProductionReport.produced_quantity), 0),
            func.count(DailyProductionReport.id),
        ).where(DailyProductionReport.tenant_id == tenant_id)
    ).one()
    avg_daily = float(avg_daily or 0)
    return {
        "method": "historical_average",
        "based_on_records": int(days or 0),
        "avg_daily_output": round(avg_daily, 2),
        "projected_weekly_output": round(avg_daily * 7, 2),
        "projected_monthly_output": round(avg_daily * 30, 2),
    }


@router.get("/demand-forecast")
def get_demand_forecast(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Demand projection from sales order value history."""
    order_count, total_value = db.execute(
        select(
            func.count(SalesOrder.id),
            func.coalesce(func.sum(SalesOrder.total_amount), 0),
        ).where(SalesOrder.tenant_id == tenant_id)
    ).one()
    order_count = int(order_count or 0)
    total_value = float(total_value or 0)
    avg_order_value = total_value / order_count if order_count else 0
    return {
        "method": "historical_average",
        "total_orders": order_count,
        "total_order_value": round(total_value, 2),
        "avg_order_value": round(avg_order_value, 2),
        "projected_next_period_orders": order_count,
        "projected_next_period_value": round(total_value, 2),
    }


@router.get("/inventory-forecast")
def get_inventory_forecast(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Items at/below reorder level that need replenishment soon."""
    rows = db.execute(
        select(
            InventoryItem.id,
            InventoryItem.name,
            InventoryItem.sku,
            InventoryItem.reorder_level,
            func.coalesce(func.sum(StockLevel.quantity), 0),
        )
        .outerjoin(StockLevel, StockLevel.item_id == InventoryItem.id)
        .where(InventoryItem.tenant_id == tenant_id)
        .group_by(InventoryItem.id)
    ).all()
    items = []
    at_risk = 0
    for r in rows:
        on_hand = int(r[4] or 0)
        reorder = int(r[3] or 0)
        needs_reorder = on_hand <= reorder
        if needs_reorder:
            at_risk += 1
        items.append(
            {
                "item_id": r[0],
                "item": r[1],
                "sku": r[2],
                "on_hand": on_hand,
                "reorder_level": reorder,
                "needs_reorder": needs_reorder,
            }
        )
    items.sort(key=lambda x: (not x["needs_reorder"], x["on_hand"]))
    return {"items_at_risk": at_risk, "items": items}
