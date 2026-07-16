"""RBAC constants shared by permissions helpers and role seeding."""

MODULE_CATALOG = [
    {"code": "dashboard", "label": "Dashboard"},
    {"code": "production", "label": "Production"},
    {"code": "inventory", "label": "Inventory & Raw Materials"},
    {"code": "procurement", "label": "Procurement"},
    {"code": "hr", "label": "HR & Employees"},
    {"code": "sales", "label": "Sales & Billing"},
    {"code": "accounts", "label": "Accounts & Reports"},
    {"code": "quality", "label": "Quality Control"},
    {"code": "maintenance", "label": "Maintenance"},
    {"code": "analytics", "label": "Analytics"},
    {"code": "alerts", "label": "Alerts & Notifications"},
    {"code": "documents", "label": "Documents"},
    {"code": "factoryMonitor", "label": "Factory Monitor"},
    {"code": "iot", "label": "IoT & Smart Factory"},
    {"code": "admin", "label": "Security & Administration"},
]

VALID_MODULES = {m["code"] for m in MODULE_CATALOG}

VALID_ACTIONS = frozenset({
    "read",
    "create",
    "update",
    "delete",
    "approve",
    "create_entry",
    "update_qty",
    "update_machine_status",
    "report_breakdown",
    "*",
})

PERMISSION_MATRIX = {
    "Admin": {
        "modules": list(VALID_MODULES),
        "description": "Full access to all modules and actions.",
    },
    "Production Manager": {
        "modules": [
            "dashboard", "production", "quality", "maintenance",
            "analytics", "alerts", "factoryMonitor", "iot",
        ],
        "description": "Production-related modules for assigned plant only.",
    },
    "Store Manager": {
        "modules": ["dashboard", "inventory", "procurement", "alerts"],
        "description": "Inventory and store operations only.",
    },
    "HR Manager": {
        "modules": ["dashboard", "hr"],
        "description": "HR and payroll modules only.",
    },
    "Accountant": {
        "modules": ["dashboard", "accounts", "sales", "documents"],
        "description": "Finance and accounts modules only.",
    },
    "Operator": {
        "modules": ["dashboard", "production", "factoryMonitor", "iot"],
        "actions": [
            "production:read",
            "production:create_entry",
            "production:update_qty",
            "production:update_machine_status",
            "production:report_breakdown",
        ],
        "description": "Shop-floor access to assigned work orders and machine only.",
    },
}
