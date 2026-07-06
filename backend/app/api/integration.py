from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import tenant_scope
from app.models.inventory import InventoryItem
from app.models.machine import Machine

router = APIRouter(prefix="/integrations", tags=["Integration Module"])

MODULE = "admin"


@router.get("/barcode-scanners")
def get_barcode_scanners(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Inventory items that carry a barcode (scanner-ready coverage)."""
    total = db.scalar(
        select(func.count(InventoryItem.id)).where(
            InventoryItem.tenant_id == tenant_id
        )
    )
    with_barcode_rows = db.execute(
        select(InventoryItem.id, InventoryItem.name, InventoryItem.sku, InventoryItem.barcode)
        .where(
            InventoryItem.tenant_id == tenant_id,
            InventoryItem.barcode.is_not(None),
            InventoryItem.barcode != "",
        )
        .order_by(InventoryItem.name)
    ).all()
    total = int(total or 0)
    return {
        "total_items": total,
        "barcoded_items": len(with_barcode_rows),
        "coverage_pct": round(len(with_barcode_rows) / total * 100, 1) if total else 0,
        "items": [
            {"id": r[0], "name": r[1], "sku": r[2], "barcode": r[3]}
            for r in with_barcode_rows
        ],
    }


@router.get("/accounting-software")
def get_accounting_software_integrations(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Status of external accounting connectors (none configured by default)."""
    return {
        "connectors": [
            {"name": "Tally", "connected": False},
            {"name": "QuickBooks", "connected": False},
            {"name": "Zoho Books", "connected": False},
        ],
        "note": "No external accounting connector is configured for this tenant.",
    }


@router.get("/iot-machines")
def get_iot_machine_integrations(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Machines available for IoT telemetry integration."""
    machines = list(
        db.scalars(
            select(Machine).where(Machine.tenant_id == tenant_id).order_by(Machine.name)
        ).all()
    )
    return [
        {
            "id": m.id,
            "code": m.code,
            "name": m.name,
            "status": m.status,
            "is_active": m.is_active,
            "telemetry_enabled": m.is_active,
        }
        for m in machines
    ]


@router.get("/api-integrations")
def get_api_integrations(
    tenant_id: int = Depends(tenant_scope(MODULE)), db: Session = Depends(get_db)
):
    """Internal API surface exposed for outbound integration."""
    return {
        "rest_base_path": "/api",
        "available_modules": [
            "production",
            "inventory",
            "procurement",
            "sales",
            "hr",
            "accounts",
            "quality",
            "maintenance",
            "analytics",
        ],
        "auth": "JWT Bearer token",
    }
