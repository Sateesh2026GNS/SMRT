"""Seed default roles with permissions for a tenant."""

from app.core.rbac_constants import MODULE_CATALOG, PERMISSION_MATRIX

MODULES = [m["code"] for m in MODULE_CATALOG]


def _permissions_for_role(name: str) -> list[str]:
    spec = PERMISSION_MATRIX.get(name, {})
    perms = list(spec.get("modules", []))
    perms.extend(spec.get("actions", []))
    if name == "Admin":
        return MODULES
    return perms


DEFAULT_ROLES = [
    {
        "name": name,
        "description": spec["description"],
        "permissions": _permissions_for_role(name),
    }
    for name, spec in PERMISSION_MATRIX.items()
]


def seed_roles(db, tenant_id: int = 1):
    from sqlalchemy import select

    from app.models.role import Role

    existing_roles = {
        r.name: r for r in db.scalars(select(Role).where(Role.tenant_id == tenant_id)).all()
    }
    for spec in DEFAULT_ROLES:
        if spec["name"] not in existing_roles:
            db.add(
                Role(
                    tenant_id=tenant_id,
                    name=spec["name"],
                    description=spec["description"],
                    permissions=spec["permissions"],
                )
            )
    db.flush()
    for spec in DEFAULT_ROLES:
        role = db.scalars(
            select(Role).where(Role.tenant_id == tenant_id, Role.name == spec["name"])
        ).first()
        if role:
            role.description = spec["description"]
            role.permissions = spec["permissions"]
    db.commit()


def seed_roles_for_tenant(db, tenant_id: int):
    seed_roles(db, tenant_id)
