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
