"""Main ERP Dashboard API — sidebar Dashboard item."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.user import User
from app.routers.operator_deps import require_tenant
from app.services.dashboard_service import get_erp_dashboard
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/erp", tags=["ERP Dashboard API"])


@router.get("/dashboard")
def erp_dashboard(
    user_tenant: tuple[User, int] = Depends(require_tenant("dashboard")),
    db: Session = Depends(get_db),
):
    user, tenant_id = user_tenant
    return success_response("ERP dashboard retrieved", get_erp_dashboard(db, tenant_id, user=user))
