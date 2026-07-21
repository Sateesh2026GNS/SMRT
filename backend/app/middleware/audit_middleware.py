"""HTTP middleware that records mutating API actions into access_logs."""

from __future__ import annotations

import logging
import re

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.database import SessionLocal
from app.services.auth_service import decode_access_token
from app.services.audit_log_service import AuditLogService, resolve_module
from app.models.user import User
from sqlalchemy import select
from sqlalchemy.orm import selectinload

logger = logging.getLogger("gns_insights.audit_middleware")

_MUTATING = {"POST", "PUT", "PATCH", "DELETE"}
_SKIP_PREFIXES = (
    "/docs",
    "/openapi",
    "/redoc",
    "/health",
    "/auth/login",
    "/api/auth/login",
    "/auth/refresh",
    "/api/auth/refresh",
    "/auth/logout",
    "/api/auth/logout",
    "/platform/",
)


def _action_for(method: str, path: str) -> str:
    method = method.upper()
    if method == "POST":
        if "export" in path or "download" in path:
            return "export_report"
        return "create"
    if method == "PUT" or method == "PATCH":
        if "password" in path:
            return "password_change"
        if "role" in path:
            return "role_change"
        if "profile" in path:
            return "profile_update"
        return "update"
    if method == "DELETE":
        return "delete"
    return method.lower()


def _resource_id_from_path(path: str) -> int | None:
    matches = re.findall(r"/(\d+)(?:/|$)", path)
    if not matches:
        return None
    try:
        return int(matches[-1])
    except ValueError:
        return None


def _human_details(action: str, path: str, module_name: str) -> str:
    resource = path.rstrip("/").split("/")[-1]
    if resource.isdigit():
        parts = [p for p in path.strip("/").split("/") if p and not p.isdigit()]
        resource = parts[-1] if parts else module_name
    label = resource.replace("-", " ").replace("_", " ").title()
    verb = {
        "create": "Created",
        "update": "Updated",
        "delete": "Deleted",
        "export_report": "Exported",
        "password_change": "Changed password for",
        "role_change": "Changed role for",
        "profile_update": "Updated profile for",
    }.get(action, action.replace("_", " ").title())
    return f"{verb} {label}."


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        try:
            path = request.url.path or ""
            if request.method.upper() not in _MUTATING:
                return response
            if any(path.startswith(p) for p in _SKIP_PREFIXES):
                return response
            if response.status_code >= 400:
                return response

            auth = request.headers.get("Authorization") or ""
            if not auth.lower().startswith("bearer "):
                return response
            token = auth.split(" ", 1)[1].strip()
            payload = decode_access_token(token)
            if not payload or payload.get("token_type") == "platform_admin":
                return response

            sub = payload.get("sub") or payload.get("user_id")
            if sub is None:
                return response
            user_id = int(sub)

            db = SessionLocal()
            try:
                user = db.scalars(
                    select(User)
                    .where(User.id == user_id)
                    .options(selectinload(User.roles), selectinload(User.tenant))
                ).first()
                if not user:
                    return response
                action = _action_for(request.method, path)
                resource = path.strip("/").replace("/", ".")[:120]
                module_name = resolve_module(action, resource, path)
                AuditLogService.log(
                    db=db,
                    request=request,
                    current_user=user,
                    action=action,
                    module_name=module_name,
                    resource=resource,
                    resource_id=_resource_id_from_path(path),
                    details=_human_details(action, path, module_name),
                )
            finally:
                db.close()
        except Exception:
            logger.exception("audit_middleware_failed path=%s", request.url.path)
        return response
