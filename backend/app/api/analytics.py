from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.services.analytics_service import (
    get_inventory_turnover_rate,
    get_machine_efficiency,
    get_monthly_production_trend,
    get_profit_analysis,
    get_worker_performance_score,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

MODULE = "analytics"


@router.get("/production-trend")
def production_trend_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    return get_monthly_production_trend(db, tenant_id, year)


@router.get("/machine-efficiency")
def machine_efficiency_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    return get_machine_efficiency(db, tenant_id)


@router.get("/inventory-turnover")
def inventory_turnover_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    return get_inventory_turnover_rate(db, tenant_id)


@router.get("/worker-performance")
def worker_performance_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    db: Session = Depends(get_db),
):
    return get_worker_performance_score(db, tenant_id)


@router.get("/profit")
def profit_analysis_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    return get_profit_analysis(db, tenant_id, year)


@router.get("/dashboard")
def analytics_dashboard_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int = Query(None),
    db: Session = Depends(get_db),
):
    from datetime import date

    y = year or date.today().year
    return {
        "monthly_production_trend": get_monthly_production_trend(db, tenant_id, y),
        "machine_efficiency": get_machine_efficiency(db, tenant_id),
        "inventory_turnover": get_inventory_turnover_rate(db, tenant_id),
        "worker_performance": get_worker_performance_score(db, tenant_id),
    }
