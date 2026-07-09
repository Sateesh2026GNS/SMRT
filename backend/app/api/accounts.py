from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.accounts import ExpenseCreate, ExpenseRead, IncomeCreate, IncomeRead
from app.services.accounts_service import (
    create_expense,
    create_income,
    get_accounts_dashboard,
    get_profit_loss,
    get_tax_report,
    list_expenses,
    list_incomes,
)
from app.services.finance_extended_service import (
    get_ap_summary,
    get_ar_summary,
    get_finance_hub,
    get_gl_summary,
    get_gst_extended,
    get_payment_summary,
    get_pl_extended,
    list_ap_enriched,
    list_ar_enriched,
    list_gl_enriched,
    list_payments_enriched,
)

router = APIRouter(prefix="/accounts", tags=["accounts"])

MODULE = "accounts"


@router.post("/income", response_model=IncomeRead)
def create_income_endpoint(
    payload: IncomeCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_income(db, payload)


@router.get("/income", response_model=list[IncomeRead])
def list_income_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_incomes(db, tenant_id, year)


@router.post("/expenses", response_model=ExpenseRead)
def create_expense_endpoint(
    payload: ExpenseCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
):
    payload.tenant_id = user.tenant_id
    return create_expense(db, payload)


@router.get("/expenses", response_model=list[ExpenseRead])
def list_expense_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return list_expenses(db, tenant_id, year)


@router.get("/dashboard")
def accounts_dashboard_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_accounts_dashboard(db, tenant_id)


@router.get("/profit-loss")
def profit_loss_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int = Query(...),
    ytd_month: int = Query(12, ge=1, le=12),
    db: Session = Depends(get_db),
):
    return get_profit_loss(db, tenant_id, year, ytd_month)


@router.get("/tax-report")
def tax_report_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    return get_tax_report(db, tenant_id, year)


@router.get("/hub")
def finance_hub_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_finance_hub(db, tenant_id)


@router.get("/ap/summary")
def ap_summary_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_ap_summary(db, tenant_id)


@router.get("/ap/enriched")
def ap_enriched_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_ap_enriched(db, tenant_id)


@router.get("/ar/summary")
def ar_summary_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_ar_summary(db, tenant_id)


@router.get("/ar/enriched")
def ar_enriched_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_ar_enriched(db, tenant_id)


@router.get("/payments/summary")
def payment_summary_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_payment_summary(db, tenant_id)


@router.get("/payments/enriched")
def payments_enriched_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_payments_enriched(db, tenant_id)


@router.get("/gl/summary")
def gl_summary_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return get_gl_summary(db, tenant_id)


@router.get("/gl/enriched")
def gl_enriched_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    return list_gl_enriched(db, tenant_id)


@router.get("/gst/extended")
def gst_extended_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    return get_gst_extended(db, tenant_id, year)


@router.get("/profit-loss/extended")
def pl_extended_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    return get_pl_extended(db, tenant_id, year)
