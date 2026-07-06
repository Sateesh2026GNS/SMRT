"""Seed default users for tenant 1 with role assignments and demo scoping data."""

DEMO_USERS = {
    "Admin": ("admin@smrt.local", "admin123", "Admin", None, None, None),
    "Production Manager": ("production@smrt.local", "demo123", "Priya Production", "plant-1", "production", None),
    "Store Manager": ("store@smrt.local", "demo123", "Sam Store", None, "store", None),
    "HR Manager": ("hr@smrt.local", "demo123", "Hira HR", None, "hr", None),
    "Accountant": ("accounts@smrt.local", "demo123", "Anil Accounts", None, "finance", None),
    "Operator": ("operator@smrt.local", "demo123", "Om Operator", "plant-1", "shop-floor", None),
}


def seed_admin_user(db):
    """Ensure a demo user exists for each seeded role on tenant 1."""
    from sqlalchemy import select

    from app.models.role import Role
    from app.models.user import User, user_roles
    from app.services.auth_service import hash_password

    roles_by_name = {
        r.name: r
        for r in db.scalars(select(Role).where(Role.tenant_id == 1)).all()
    }

    for role_name, (email, password, full_name, plant_code, department, machine_id) in DEMO_USERS.items():
        role = roles_by_name.get(role_name)
        if not role:
            continue
        existing = db.scalars(select(User).where(User.email == email)).first()
        if existing:
            existing.plant_code = plant_code or existing.plant_code
            existing.department = department or existing.department
            if not existing.email_verified:
                existing.email_verified = True
                existing.is_active = True
            continue
        user = User(
            tenant_id=1,
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=True,
            email_verified=True,
            plant_code=plant_code,
            department=department,
            assigned_machine_id=machine_id,
        )
        db.add(user)
        db.flush()
        db.execute(user_roles.insert().values(user_id=user.id, role_id=role.id))

    db.commit()
    _seed_operator_assignments(db)


def _seed_operator_assignments(db):
    """Assign demo machine and work order to the operator user."""
    from sqlalchemy import select

    from app.core.seed_products import seed_products
    from app.models.machine import Machine
    from app.models.product import Product
    from app.models.production import ProductionOrder, WorkOrder
    from app.models.user import User

    operator = db.scalars(select(User).where(User.email == "operator@smrt.local")).first()
    if not operator:
        return

    seed_products(db, 1)

    machine = db.scalars(
        select(Machine).where(Machine.tenant_id == 1, Machine.code == "CNC-01")
    ).first()
    if not machine:
        machine = Machine(
            tenant_id=1,
            code="CNC-01",
            name="CNC Milling Unit",
            status="running",
            plant_code="plant-1",
        )
        db.add(machine)
        db.flush()

    operator.assigned_machine_id = machine.id
    prod_mgr = db.scalars(select(User).where(User.email == "production@smrt.local")).first()
    if prod_mgr and not prod_mgr.plant_code:
        prod_mgr.plant_code = "plant-1"

    product = db.scalars(select(Product).where(Product.tenant_id == 1)).first()
    if not product:
        db.commit()
        return

    wo = db.scalars(
        select(WorkOrder).where(
            WorkOrder.tenant_id == 1,
            WorkOrder.work_order_number == "WO-OPERATOR-001",
        )
    ).first()
    if not wo:
        order = db.scalars(
            select(ProductionOrder).where(
                ProductionOrder.tenant_id == 1,
                ProductionOrder.order_number == "PO-OPERATOR-001",
            )
        ).first()
        if not order:
            order = ProductionOrder(
                tenant_id=1,
                product_id=product.id,
                order_number="PO-OPERATOR-001",
                planned_quantity=500,
                status="in_progress",
            )
            db.add(order)
            db.flush()
        wo = WorkOrder(
            tenant_id=1,
            production_order_id=order.id,
            machine_id=machine.id,
            assigned_user_id=operator.id,
            plant_code="plant-1",
            work_order_number="WO-OPERATOR-001",
            planned_quantity=500,
            status="in_progress",
        )
        db.add(wo)

    db.commit()
