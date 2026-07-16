from sqlalchemy.orm import Session

from app.models.security import AuditLog


def log_audit(
    db: Session,
    *,
    tenant_id: int,
    user_id: int | None,
    action: str,
    resource: str,
    resource_id: int | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> None:
    db.add(
        AuditLog(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
        )
    )
    db.commit()
