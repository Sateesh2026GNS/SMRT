"""ERP sidebar API routers."""

from app.routers.dashboard_api import router as dashboard_api_router
from app.routers.masters_api import router as masters_api_router
from app.routers.notifications_api import router as notifications_api_router
from app.routers.operator_api import router as operator_api_router
from app.routers.production_api import router as production_api_router
from app.routers.settings_api import router as settings_api_router

__all__ = [
    "dashboard_api_router",
    "masters_api_router",
    "notifications_api_router",
    "operator_api_router",
    "production_api_router",
    "settings_api_router",
]
