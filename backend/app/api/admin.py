<<<<<<< HEAD
"""Admin panel API: user & role management (RBAC), activity logs.

All endpoints require an authenticated administrator and are scoped to the
acting user's tenant. Other roles are rejected with 403.

Legacy flat JSON responses — see /api/settings/* for the standard envelope.
"""

from fastapi import APIRouter, Depends, Query, Request
=======
from fastapi import APIRouter, Depends, status
>>>>>>> 42502626 (first commit)
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_admin
from app.models.user import User
<<<<<<< HEAD
from app.schemas.rbac import (
    RoleCreate,
    RolePermissionsUpdate,
    RoleUpdate,
    UserCreate,
    UserUpdate,
)
from app.services.settings_service import SettingsService
=======
from app.services import rbac_service
from app.schemas.rbac import (
    UserCreate,
    UserUpdate,
    RoleCreate,
    RoleUpdate,
    RoleRead,
    UserRead,
    PermissionModuleRead,
    AccessLogRead,
)
>>>>>>> 42502626 (first commit)

router = APIRouter(prefix="/admin", tags=["admin"])


<<<<<<< HEAD
def _svc(db: Session, admin: User) -> SettingsService:
    return SettingsService(db, admin)


# ---------------------------------------------------------------------------
# Permission catalogue
# ---------------------------------------------------------------------------
@router.get("/permissions/modules")
def list_modules(_: User = Depends(require_admin)):
    return SettingsService.list_modules()


@router.get("/permissions/matrix")
def permission_matrix(_: User = Depends(require_admin)):
    return SettingsService.permission_matrix()


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
@router.get("/users")
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return _svc(db, admin).list_users()


@router.get("/users/stats")
def user_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return _svc(db, admin).user_stats()


@router.get("/users/{user_id}")
def get_user(
    user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    return _svc(db, admin).get_user(user_id)


@router.post("/users", status_code=201)
def create_user(
    payload: UserCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _svc(db, admin).create_user(payload, request)


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _svc(db, admin).update_user(user_id, payload, request)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _svc(db, admin).delete_user(user_id, request)


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------
@router.get("/roles")
def list_roles(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return _svc(db, admin).list_roles()


@router.get("/roles/{role_id}")
def get_role(
    role_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    return _svc(db, admin).get_role(role_id)


@router.post("/roles", status_code=201)
def create_role(
    payload: RoleCreate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _svc(db, admin).create_role(payload, request)


@router.put("/roles/{role_id}")
def update_role(
    role_id: int,
    payload: RoleUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _svc(db, admin).update_role(role_id, payload, request)


@router.put("/roles/{role_id}/permissions")
def update_role_permissions(
    role_id: int,
    payload: RolePermissionsUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _svc(db, admin).update_role_permissions(role_id, payload, request)


@router.delete("/roles/{role_id}")
def delete_role(
    role_id: int,
    request: Request,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return _svc(db, admin).delete_role(role_id, request)


# ---------------------------------------------------------------------------
# Activity / access logs
# ---------------------------------------------------------------------------
@router.get("/access-logs")
def list_access_logs(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(200, ge=1, le=500),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    data = _svc(db, admin).list_audit_logs(
        search=search, page=page, page_size=page_size
    )
    return data["items"]


# ---------------------------------------------------------------------------
# Pending approvals (admin dashboard)
# ---------------------------------------------------------------------------
@router.get("/approvals")
def pending_approvals(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    from app.services.approval_service import get_pending_approvals

    return get_pending_approvals(db, admin.tenant_id)
=======
# ----- Users -----

@router.get("/users", response_model=list[UserRead])
def list_users_endpoint(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return rbac_service.list_users(db, current_user.tenant_id)


@router.get("/users/{user_id}", response_model=UserRead)
def get_user_endpoint(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return rbac_service.get_user(db, current_user.tenant_id, user_id)


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(
    payload: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user_dict = rbac_service.create_user(db, current_user.tenant_id, payload)
    rbac_service.log_activity(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="create_user",
        resource="users",
        resource_id=user_dict["id"],
    )
    return user_dict


@router.put("/users/{user_id}", response_model=UserRead)
def update_user_endpoint(
    user_id: int,
    payload: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user_dict = rbac_service.update_user(db, current_user.tenant_id, user_id, payload, current_user)
    rbac_service.log_activity(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="update_user",
        resource="users",
        resource_id=user_id,
    )
    return user_dict


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    rbac_service.delete_user(db, current_user.tenant_id, user_id, current_user)
    rbac_service.log_activity(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="delete_user",
        resource="users",
        resource_id=user_id,
    )


# ----- Roles -----

@router.get("/roles", response_model=list[RoleRead])
def list_roles_endpoint(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return rbac_service.list_roles(db, current_user.tenant_id)


@router.get("/roles/{role_id}", response_model=RoleRead)
def get_role_endpoint(
    role_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return rbac_service.get_role(db, current_user.tenant_id, role_id)


@router.post("/roles", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
def create_role_endpoint(
    payload: RoleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role_dict = rbac_service.create_role(db, current_user.tenant_id, payload)
    rbac_service.log_activity(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="create_role",
        resource="roles",
        resource_id=role_dict["id"],
    )
    return role_dict


@router.put("/roles/{role_id}", response_model=RoleRead)
def update_role_endpoint(
    role_id: int,
    payload: RoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role_dict = rbac_service.update_role(db, current_user.tenant_id, role_id, payload)
    rbac_service.log_activity(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="update_role",
        resource="roles",
        resource_id=role_id,
    )
    return role_dict


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role_endpoint(
    role_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    rbac_service.delete_role(db, current_user.tenant_id, role_id)
    rbac_service.log_activity(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="delete_role",
        resource="roles",
        resource_id=role_id,
    )


# ----- Permissions -----

@router.get("/permissions/modules", response_model=list[PermissionModuleRead])
def list_permissions_modules_endpoint(
    current_user: User = Depends(require_admin),
):
    from app.core.rbac_constants import MODULE_CATALOG
    return MODULE_CATALOG


# ----- Access / Audit Logs -----

@router.get("/access-logs", response_model=list[AccessLogRead])
def list_access_logs_endpoint(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return rbac_service.list_activities(db, current_user.tenant_id)


# ----- Testing / Reset Data -----

def _resolve_db_paths():
    """Return (db_path, undo_path) as absolute Path objects.

    The paths are resolved relative to the *backend root* directory (the
    folder that contains ``smrt.db``) regardless of the working directory
    that uvicorn was launched from.
    """
    from pathlib import Path
    # admin.py lives at  backend/app/api/admin.py
    # backend root      = backend/
    backend_root = Path(__file__).resolve().parent.parent.parent
    return backend_root / "smrt.db", backend_root / "smrt.db.undo"


@router.post("/clear-data")
def clear_data_endpoint(db: Session = Depends(get_db)):
    import shutil
    import time
    from fastapi import HTTPException
    from sqlalchemy import text
    from app.core.database import engine

    db_path, undo_path = _resolve_db_paths()

    # 1. Flush & commit any pending work, then close the session so the
    #    file is not locked when we copy it for the undo snapshot.
    try:
        db.commit()
    except Exception:
        pass
    db.close()

    # 2. Create the undo snapshot BEFORE deleting anything.
    try:
        if db_path.exists():
            shutil.copy2(str(db_path), str(undo_path))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create undo backup: {str(e)}"
        )

    # 3. Re-open a fresh session from the pool to perform the deletes.
    from app.core.database import SessionLocal
    fresh_db = SessionLocal()
    try:
        # Tables ordered so child rows are deleted before parents where
        # foreign-key constraints would otherwise block the delete.
        # We also disable FK enforcement for the duration to be safe.
        tables_to_clear = [
            # Production
            'work_orders',
            'production_orders',
            'batches',
            'daily_production_reports',
            # Sales / CRM
            'dispatch_shipments',
            'invoice_items',
            'invoices',
            'payments',
            'sales_orders',
            'quotations',
            'leads',
            'customers',
            # Inventory / Stock
            'stock_movements',
            'stock_levels',
            'stock_transfers',
            'stock_adjustments',
            'inventory_items',
            # Warehouses (delete stock first, then the warehouse itself)
            'warehouses',
            # Procurement
            'goods_receipt_lines',
            'goods_receipts',
            'purchase_order_lines',
            'purchase_orders',
            'supplier_payments',
            'vendor_bills',
            'vendor_quotations',
            'material_request_lines',
            'material_requests',
            'rfqs',
            # Vendors / Suppliers (delete after procurement rows that ref them)
            'suppliers',
            # Quality
            'defects',
            'quality_inspections',
            'batch_quality_reports',
            'compliance_logs',
            # Maintenance
            'breakdown_reports',
            'maintenance_records',
            'preventive_maintenance',
            'maintenance_schedules',
            # HR
            'attendance_records',
            'leave_requests',
            'payroll_records',
            'performance_reviews',
            'shifts',
            'employees',
            'departments',
            # Finance
            'income',
            'expenses',
            # Documents
            'documents',
            # Assets / Masters
            'bill_of_materials',
            'products',
            'machines',
            'machine_status_events',
            # General / Logs
            'alerts',
            'tasks',
            'ai_messages',
            'ai_conversations',
            'user_notification_states',
            'audit_logs',
            'access_logs',
        ]

        fresh_db.execute(text("PRAGMA foreign_keys = OFF;"))
        for table in tables_to_clear:
            fresh_db.execute(text(f"DELETE FROM {table};"))
        fresh_db.execute(text("PRAGMA foreign_keys = ON;"))
        fresh_db.commit()
    except Exception as e:
        fresh_db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear database tables: {str(e)}"
        )
    finally:
        fresh_db.close()

    return {"success": True, "message": "All data cleared successfully"}


@router.post("/undo-data")
def undo_data_endpoint(db: Session = Depends(get_db)):
    import shutil
    import time
    from fastapi import HTTPException
    from app.core.database import engine

    db_path, undo_path = _resolve_db_paths()

    if not undo_path.exists():
        raise HTTPException(
            status_code=400,
            detail="No clear-data backup found to undo."
        )

    try:
        # Step 1: Close the injected session explicitly so SQLite releases
        # its read lock on smrt.db before we overwrite the file.
        db.close()

        # Step 2: Dispose the entire SQLAlchemy connection pool.  Every
        # pooled connection is invalidated; new requests will open fresh
        # handles to whatever file is on disk after the copy.
        engine.dispose()

        # Step 3: Brief pause so the OS (especially Windows) can fully
        # release any remaining file handles or WAL/SHM locks.
        time.sleep(0.3)

        # Step 4: Overwrite smrt.db with the undo snapshot.
        shutil.copy2(str(undo_path), str(db_path))

        # Step 5: Dispose once more so the very next request opens a fresh
        # connection to the restored file instead of a stale cached one.
        engine.dispose()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restore database from backup: {str(e)}"
        )

    return {"success": True, "message": "Database restored from backup successfully"}

>>>>>>> 42502626 (first commit)
