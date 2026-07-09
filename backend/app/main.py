import time
import uuid

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import get_settings
from app.core.logging_config import get_logger, setup_logging

from app.api.accounts import router as accounts_router
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.analytics import router as analytics_router
from app.api.alerts import router as alerts_router
from app.api.documents import router as documents_router
from app.api.hr import router as hr_router
from app.api.inventory import router as inventory_router
from app.api.maintenance import router as maintenance_router
from app.api.procurement import router as procurement_router
from app.api.production import router as production_router
from app.api.quality import router as quality_router
from app.api.sales import router as sales_router
from app.api.factory_monitor import router as factory_monitor_router
from app.api.production_scheduling import router as production_scheduling_router
from app.api.supply_chain import router as supply_chain_router
from app.api.warehouse import router as warehouse_router
from app.api.dispatch import router as dispatch_router
from app.api.product_management import router as product_management_router
from app.api.forecasting import router as forecasting_router
from app.api.audit_logs import router as audit_logs_router
from app.api.task_management import router as task_management_router
from app.api.integration import router as integration_router
from app.api.settings import router as settings_router
from app.api.iot import router as iot_router
from app.core.database import engine
from app.models.base import Base

# Import all models so they register with Base.metadata
from app.models import (  # noqa: F401
    accounts,
    admin,
    alert,
    bom,
    company_settings,
    department,
    document,
    hr,
    inventory,
    machine,
    maintenance,
    procurement,
    production,
    product,
    quality,
    role,
    sales,
    security,
    task,
    tenant,
    user,
)

settings = get_settings()
setup_logging("INFO")
logger = get_logger("smrt")

app = FastAPI(title="SMRT Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """Attach a request id, time the request, and log the outcome."""
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request.state.request_id = request_id
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        elapsed = (time.perf_counter() - start) * 1000
        logger.exception(
            "request_failed id=%s %s %s (%.1fms)",
            request_id,
            request.method,
            request.url.path,
            elapsed,
        )
        raise
    elapsed = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "id=%s %s %s -> %s (%.1fms)",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        elapsed,
    )
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "request_id": getattr(request.state, "request_id", None)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("database_error id=%s", getattr(request.state, "request_id", None))
    return JSONResponse(
        status_code=500,
        content={
            "detail": "A database error occurred.",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_error id=%s", getattr(request.state, "request_id", None))
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error.",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "environment": settings.environment}


@app.get("/health/db", tags=["health"])
def health_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "reachable"}
    except SQLAlchemyError:
        return JSONResponse(status_code=503, content={"status": "error", "database": "unreachable"})


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Add phone column if missing (for existing DBs)
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20)"))
    except Exception:
        pass  # Column may already exist
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE roles ADD COLUMN permissions JSON NOT NULL DEFAULT '[]'"
                )
            )
    except Exception:
        pass  # Column may already exist
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE inventory_items ADD COLUMN item_type VARCHAR(32) NOT NULL DEFAULT 'raw_material'"
                )
            )
    except Exception:
        pass  # Column may already exist
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE suppliers ADD COLUMN approval_status VARCHAR(32) NOT NULL DEFAULT 'approved'"
                )
            )
    except Exception:
        pass  # Column may already exist
    _user_security_columns = [
        "ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT 0",
        "ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE users ADD COLUMN locked_until DATETIME",
        "ALTER TABLE users ADD COLUMN last_activity_at DATETIME",
    ]
    for ddl in _user_security_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _warehouse_columns = [
        "ALTER TABLE warehouses ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'active'",
        "ALTER TABLE warehouses ADD COLUMN warehouse_type VARCHAR(64)",
        "ALTER TABLE warehouses ADD COLUMN branch VARCHAR(128)",
        "ALTER TABLE warehouses ADD COLUMN plant VARCHAR(128)",
        "ALTER TABLE warehouses ADD COLUMN address VARCHAR(512)",
        "ALTER TABLE warehouses ADD COLUMN city VARCHAR(128)",
        "ALTER TABLE warehouses ADD COLUMN state VARCHAR(128)",
        "ALTER TABLE warehouses ADD COLUMN pincode VARCHAR(16)",
        "ALTER TABLE warehouses ADD COLUMN manager_name VARCHAR(255)",
        "ALTER TABLE warehouses ADD COLUMN manager_phone VARCHAR(64)",
        "ALTER TABLE warehouses ADD COLUMN rack_count INTEGER",
        "ALTER TABLE warehouses ADD COLUMN bin_count INTEGER",
    ]
    for ddl in _warehouse_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _supplier_vendor_columns = [
        "ALTER TABLE suppliers ADD COLUMN vendor_code VARCHAR(32)",
        "ALTER TABLE suppliers ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'active'",
        "ALTER TABLE suppliers ADD COLUMN alternate_contact VARCHAR(255)",
        "ALTER TABLE suppliers ADD COLUMN website VARCHAR(255)",
        "ALTER TABLE suppliers ADD COLUMN vendor_type VARCHAR(64)",
        "ALTER TABLE suppliers ADD COLUMN category VARCHAR(128)",
        "ALTER TABLE suppliers ADD COLUMN material_type VARCHAR(128)",
        "ALTER TABLE suppliers ADD COLUMN gstin VARCHAR(64)",
        "ALTER TABLE suppliers ADD COLUMN pan VARCHAR(32)",
        "ALTER TABLE suppliers ADD COLUMN msme VARCHAR(64)",
        "ALTER TABLE suppliers ADD COLUMN billing_address VARCHAR(512)",
        "ALTER TABLE suppliers ADD COLUMN factory_address VARCHAR(512)",
        "ALTER TABLE suppliers ADD COLUMN city VARCHAR(128)",
        "ALTER TABLE suppliers ADD COLUMN state VARCHAR(128)",
        "ALTER TABLE suppliers ADD COLUMN country VARCHAR(64) DEFAULT 'India'",
        "ALTER TABLE suppliers ADD COLUMN pincode VARCHAR(16)",
        "ALTER TABLE suppliers ADD COLUMN bank_name VARCHAR(255)",
        "ALTER TABLE suppliers ADD COLUMN account_number VARCHAR(64)",
        "ALTER TABLE suppliers ADD COLUMN ifsc VARCHAR(32)",
        "ALTER TABLE suppliers ADD COLUMN payment_terms VARCHAR(64)",
        "ALTER TABLE suppliers ADD COLUMN credit_days INTEGER",
        "ALTER TABLE suppliers ADD COLUMN rating NUMERIC(3,1)",
        "ALTER TABLE suppliers ADD COLUMN quality_score NUMERIC(5,2)",
        "ALTER TABLE suppliers ADD COLUMN delivery_score NUMERIC(5,2)",
        "ALTER TABLE suppliers ADD COLUMN price_score NUMERIC(5,2)",
        "ALTER TABLE suppliers ADD COLUMN service_score NUMERIC(5,2)",
    ]
    for ddl in _supplier_vendor_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _rbac_columns = [
        "ALTER TABLE users ADD COLUMN plant_code VARCHAR(64)",
        "ALTER TABLE users ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE users ADD COLUMN assigned_machine_id INTEGER REFERENCES machines(id)",
        "ALTER TABLE work_orders ADD COLUMN assigned_user_id INTEGER REFERENCES users(id)",
        "ALTER TABLE work_orders ADD COLUMN plant_code VARCHAR(64)",
        "ALTER TABLE machines ADD COLUMN plant_code VARCHAR(64)",
        "ALTER TABLE machines ADD COLUMN machine_type VARCHAR(64)",
        "ALTER TABLE machines ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE machines ADD COLUMN production_line VARCHAR(128)",
        "ALTER TABLE machines ADD COLUMN work_center VARCHAR(128)",
        "ALTER TABLE machines ADD COLUMN manufacturer VARCHAR(255)",
        "ALTER TABLE machines ADD COLUMN model_name VARCHAR(128)",
        "ALTER TABLE machines ADD COLUMN serial_number VARCHAR(128)",
        "ALTER TABLE machines ADD COLUMN purchase_date DATE",
        "ALTER TABLE machines ADD COLUMN warranty_until DATE",
        "ALTER TABLE machines ADD COLUMN assigned_operator VARCHAR(255)",
        "ALTER TABLE machines ADD COLUMN current_shift VARCHAR(64)",
        "ALTER TABLE machines ADD COLUMN health_score NUMERIC(5,2)",
        "ALTER TABLE machines ADD COLUMN efficiency_pct NUMERIC(5,2)",
        "ALTER TABLE machines ADD COLUMN oee_pct NUMERIC(5,2)",
        "ALTER TABLE machines ADD COLUMN temperature_c NUMERIC(6,2)",
        "ALTER TABLE machines ADD COLUMN rpm NUMERIC(8,2)",
        "ALTER TABLE machines ADD COLUMN last_maintenance_date DATE",
        "ALTER TABLE machines ADD COLUMN next_maintenance_date DATE",
        "ALTER TABLE daily_production_reports ADD COLUMN created_by_user_id INTEGER REFERENCES users(id)",
    ]
    for ddl in _rbac_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _production_order_columns = [
        "ALTER TABLE production_orders ADD COLUMN customer_name VARCHAR(255)",
        "ALTER TABLE production_orders ADD COLUMN priority VARCHAR(16) NOT NULL DEFAULT 'medium'",
        "ALTER TABLE production_orders ADD COLUMN bom_version VARCHAR(64)",
        "ALTER TABLE production_orders ADD COLUMN sales_order_number VARCHAR(64)",
        "ALTER TABLE production_orders ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE production_orders ADD COLUMN shift VARCHAR(64)",
        "ALTER TABLE work_orders ADD COLUMN priority VARCHAR(16) NOT NULL DEFAULT 'medium'",
        "ALTER TABLE work_orders ADD COLUMN shift VARCHAR(64)",
        "ALTER TABLE work_orders ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE work_orders ADD COLUMN supervisor VARCHAR(255)",
    ]
    for ddl in _production_order_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _inventory_columns = [
        "ALTER TABLE inventory_items ADD COLUMN category VARCHAR(128)",
        "ALTER TABLE stock_movements ADD COLUMN reference VARCHAR(128)",
        "ALTER TABLE stock_movements ADD COLUMN batch_number VARCHAR(64)",
        "ALTER TABLE stock_movements ADD COLUMN created_by VARCHAR(255)",
    ]
    for ddl in _inventory_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _procurement_columns = [
        "ALTER TABLE material_requests ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE material_requests ADD COLUMN warehouse_id INTEGER REFERENCES warehouses(id)",
        "ALTER TABLE material_requests ADD COLUMN priority VARCHAR(16) NOT NULL DEFAULT 'medium'",
        "ALTER TABLE material_requests ADD COLUMN approval_status VARCHAR(32) NOT NULL DEFAULT 'pending'",
        "ALTER TABLE purchase_orders ADD COLUMN payment_terms VARCHAR(128)",
        "ALTER TABLE purchase_orders ADD COLUMN buyer VARCHAR(255)",
        "ALTER TABLE purchase_orders ADD COLUMN warehouse_id INTEGER REFERENCES warehouses(id)",
        "ALTER TABLE purchase_orders ADD COLUMN gst_amount NUMERIC(12,2)",
        "ALTER TABLE purchase_orders ADD COLUMN discount NUMERIC(12,2)",
        "ALTER TABLE goods_receipts ADD COLUMN qc_status VARCHAR(32) NOT NULL DEFAULT 'pending'",
        "ALTER TABLE goods_receipts ADD COLUMN received_by VARCHAR(255)",
    ]
    for ddl in _procurement_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _sales_columns = [
        "ALTER TABLE leads ADD COLUMN sales_executive VARCHAR(255)",
        "ALTER TABLE leads ADD COLUMN industry VARCHAR(128)",
        "ALTER TABLE leads ADD COLUMN region VARCHAR(128)",
        "ALTER TABLE leads ADD COLUMN priority VARCHAR(16) NOT NULL DEFAULT 'medium'",
        "ALTER TABLE leads ADD COLUMN next_followup DATE",
        "ALTER TABLE leads ADD COLUMN opportunity_value NUMERIC(12,2)",
        "ALTER TABLE quotations ADD COLUMN sales_person VARCHAR(255)",
        "ALTER TABLE quotations ADD COLUMN discount NUMERIC(12,2) NOT NULL DEFAULT 0",
        "ALTER TABLE quotations ADD COLUMN gst_amount NUMERIC(12,2)",
        "ALTER TABLE quotations ADD COLUMN freight NUMERIC(12,2)",
        "ALTER TABLE sales_orders ADD COLUMN delivery_date DATE",
        "ALTER TABLE sales_orders ADD COLUMN payment_terms VARCHAR(128)",
        "ALTER TABLE sales_orders ADD COLUMN warehouse_id INTEGER REFERENCES warehouses(id)",
        "ALTER TABLE sales_orders ADD COLUMN sales_person VARCHAR(255)",
    ]
    for ddl in _sales_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _hr_columns = [
        "ALTER TABLE employees ADD COLUMN designation VARCHAR(128)",
        "ALTER TABLE employees ADD COLUMN shift_name VARCHAR(64)",
        "ALTER TABLE employees ADD COLUMN reporting_manager VARCHAR(255)",
        "ALTER TABLE employees ADD COLUMN employment_type VARCHAR(32)",
        "ALTER TABLE employees ADD COLUMN phone VARCHAR(64)",
        "ALTER TABLE employees ADD COLUMN salary NUMERIC(12,2)",
        "ALTER TABLE attendance_records ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'present'",
        "ALTER TABLE attendance_records ADD COLUMN source VARCHAR(32)",
        "ALTER TABLE payroll_records ADD COLUMN basic NUMERIC(12,2)",
        "ALTER TABLE payroll_records ADD COLUMN allowance NUMERIC(12,2)",
        "ALTER TABLE payroll_records ADD COLUMN bonus NUMERIC(12,2)",
        "ALTER TABLE payroll_records ADD COLUMN pf NUMERIC(12,2)",
        "ALTER TABLE payroll_records ADD COLUMN esi NUMERIC(12,2)",
        "ALTER TABLE payroll_records ADD COLUMN tax NUMERIC(12,2)",
    ]
    for ddl in _hr_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _quality_columns = [
        "ALTER TABLE quality_inspections ADD COLUMN inspection_type VARCHAR(32) NOT NULL DEFAULT 'incoming'",
        "ALTER TABLE quality_inspections ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'pending'",
        "ALTER TABLE quality_inspections ADD COLUMN po_reference VARCHAR(64)",
        "ALTER TABLE quality_inspections ADD COLUMN vendor_name VARCHAR(255)",
        "ALTER TABLE quality_inspections ADD COLUMN material_name VARCHAR(255)",
        "ALTER TABLE quality_inspections ADD COLUMN quantity NUMERIC(12,2)",
        "ALTER TABLE quality_inspections ADD COLUMN batch_code VARCHAR(64)",
        "ALTER TABLE quality_inspections ADD COLUMN work_order_number VARCHAR(64)",
        "ALTER TABLE quality_inspections ADD COLUMN machine_name VARCHAR(255)",
        "ALTER TABLE quality_inspections ADD COLUMN shift VARCHAR(64)",
        "ALTER TABLE quality_inspections ADD COLUMN operator_name VARCHAR(255)",
        "ALTER TABLE quality_inspections ADD COLUMN customer_name VARCHAR(255)",
        "ALTER TABLE quality_inspections ADD COLUMN sales_order_number VARCHAR(64)",
        "ALTER TABLE quality_inspections ADD COLUMN product_name VARCHAR(255)",
        "ALTER TABLE quality_inspections ADD COLUMN packing_status VARCHAR(32)",
        "ALTER TABLE quality_inspections ADD COLUMN approval VARCHAR(32)",
        "ALTER TABLE quality_inspections ADD COLUMN certificate_ref VARCHAR(128)",
        "ALTER TABLE quality_inspections ADD COLUMN inspection_time_minutes NUMERIC(8,2)",
        "ALTER TABLE quality_inspections ADD COLUMN attachment VARCHAR(512)",
        "ALTER TABLE defects ADD COLUMN product_name VARCHAR(255)",
        "ALTER TABLE defects ADD COLUMN batch_code VARCHAR(64)",
        "ALTER TABLE defects ADD COLUMN machine_name VARCHAR(255)",
        "ALTER TABLE defects ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE defects ADD COLUMN root_cause TEXT",
        "ALTER TABLE defects ADD COLUMN corrective_action TEXT",
        "ALTER TABLE defects ADD COLUMN preventive_action TEXT",
        "ALTER TABLE defects ADD COLUMN assigned_to VARCHAR(255)",
        "ALTER TABLE defects ADD COLUMN due_date DATE",
        "ALTER TABLE defects ADD COLUMN attachment VARCHAR(512)",
        "ALTER TABLE batch_quality_reports ADD COLUMN product_name VARCHAR(255)",
        "ALTER TABLE batch_quality_reports ADD COLUMN batch_code VARCHAR(64)",
        "ALTER TABLE batch_quality_reports ADD COLUMN shift VARCHAR(64)",
        "ALTER TABLE batch_quality_reports ADD COLUMN production_qty INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE batch_quality_reports ADD COLUMN reject_qty INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE batch_quality_reports ADD COLUMN rework_qty INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE batch_quality_reports ADD COLUMN inspector VARCHAR(255)",
    ]
    for ddl in _quality_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    _maintenance_columns = [
        "ALTER TABLE preventive_maintenance ADD COLUMN assigned_engineer VARCHAR(255)",
        "ALTER TABLE preventive_maintenance ADD COLUMN estimated_duration_minutes INTEGER",
        "ALTER TABLE preventive_maintenance ADD COLUMN next_due_date DATE",
        "ALTER TABLE preventive_maintenance ADD COLUMN maintenance_type VARCHAR(64)",
        "ALTER TABLE preventive_maintenance ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE breakdown_reports ADD COLUMN breakdown_number VARCHAR(64)",
        "ALTER TABLE breakdown_reports ADD COLUMN reported_by VARCHAR(255)",
        "ALTER TABLE breakdown_reports ADD COLUMN cause TEXT",
        "ALTER TABLE breakdown_reports ADD COLUMN severity VARCHAR(32) NOT NULL DEFAULT 'medium'",
        "ALTER TABLE breakdown_reports ADD COLUMN priority VARCHAR(32) NOT NULL DEFAULT 'medium'",
        "ALTER TABLE breakdown_reports ADD COLUMN engineer VARCHAR(255)",
        "ALTER TABLE breakdown_reports ADD COLUMN estimated_completion DATETIME",
        "ALTER TABLE breakdown_reports ADD COLUMN department VARCHAR(128)",
        "ALTER TABLE maintenance_records ADD COLUMN activity VARCHAR(128)",
        "ALTER TABLE maintenance_records ADD COLUMN spare_parts VARCHAR(512)",
        "ALTER TABLE maintenance_records ADD COLUMN downtime_minutes INTEGER",
        "ALTER TABLE maintenance_records ADD COLUMN remarks TEXT",
        "ALTER TABLE maintenance_records ADD COLUMN attachment VARCHAR(512)",
    ]
    for ddl in _maintenance_columns:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass
    try:
        with engine.begin() as conn:
            conn.execute(text("UPDATE users SET email_verified = 1 WHERE email_verified = 0"))
    except Exception:
        pass
    from app.core.database import SessionLocal
    from app.core.seed_products import seed_products
    from app.core.seed_roles import seed_roles
    from app.core.seed_tenant import seed_tenant
    from app.core.seed_users import seed_admin_user

    db = SessionLocal()
    try:
        seed_tenant(db)  # Ensure tenant 1 exists
        seed_roles(db)  # Seeds default roles for tenant 1
        seed_admin_user(db)  # admin@smrt.local / admin123 if no users
        seed_products(db)  # Seeds sample products for tenant 1
    except Exception:
        logger.exception("Seed warning during startup")
    finally:
        db.close()


app.include_router(auth_router)
app.include_router(production_router)
app.include_router(inventory_router)
app.include_router(procurement_router)
app.include_router(hr_router)
app.include_router(sales_router)
app.include_router(accounts_router)
app.include_router(analytics_router)
app.include_router(quality_router)
app.include_router(maintenance_router)
app.include_router(alerts_router)
app.include_router(admin_router)
app.include_router(documents_router)
app.include_router(factory_monitor_router)
app.include_router(production_scheduling_router)
app.include_router(supply_chain_router)
app.include_router(warehouse_router)
app.include_router(dispatch_router)
app.include_router(product_management_router)
app.include_router(forecasting_router)
app.include_router(audit_logs_router)
app.include_router(task_management_router)
app.include_router(integration_router)
app.include_router(settings_router)
app.include_router(iot_router)