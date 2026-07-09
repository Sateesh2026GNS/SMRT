/**
 * Enterprise RBAC — module codes, action permissions, and route mapping.
 * Keep in sync with backend `app/core/permissions.py` PERMISSION_MATRIX.
 */

export const ROLES = [
  { id: "admin", name: "Admin", description: "Full system access" },
  { id: "production_manager", name: "Production Manager", description: "Production modules for assigned plant" },
  { id: "store_manager", name: "Store Manager", description: "Inventory and store operations" },
  { id: "hr_manager", name: "HR Manager", description: "HR and payroll" },
  { id: "accountant", name: "Accountant", description: "Finance and accounts" },
  { id: "operator", name: "Operator", description: "Assigned work orders and machine only" },
];

export const MODULES = [
  "dashboard", "production", "inventory", "procurement", "hr", "sales",
  "accounts", "quality", "maintenance", "analytics", "alerts", "admin",
  "documents", "factoryMonitor", "iot",
];

/** Static fallback matrix — API permissions take precedence when present. */
export const ROLE_PERMISSIONS = {
  Admin: MODULES,
  "Production Manager": ["dashboard", "production", "quality", "maintenance", "analytics", "alerts", "factoryMonitor", "iot"],
  "Store Manager": ["dashboard", "inventory", "procurement", "alerts"],
  "HR Manager": ["dashboard", "hr"],
  Accountant: ["dashboard", "accounts", "sales", "documents"],
  Operator: [
    "dashboard", "production", "factoryMonitor", "iot",
    "production:read", "production:create_entry", "production:update_qty",
    "production:update_machine_status", "production:report_breakdown",
  ],
};

export const RESTRICTED_ACTION_ROLES = new Set(["Operator"]);

export const VALID_ACTIONS = new Set([
  "read", "create", "update", "delete", "approve",
  "create_entry", "update_qty", "update_machine_status", "report_breakdown", "*",
]);

/** Path-specific overrides evaluated before prefix matching. */
export const ROUTE_MODULE_OVERRIDES = {
  "/settings/permissions": "dashboard",
  "/settings/alerts": "dashboard",
  "/settings/subscription": "dashboard",
  "/masters/departments": "hr",
  "/masters/products": "production",
  "/masters/bom": "production",
  "/production/schedule": "production",
  "/procurement/rfq": "procurement",
  "/finance/accounts-payable": "accounts",
  "/finance/accounts-receivable": "accounts",
  "/finance/payment-tracking": "accounts",
  "/finance/general-ledger": "accounts",
  "/quality/incoming": "quality",
  "/quality/in-process": "quality",
  "/quality/final": "quality",
  "/maintenance/machine-history": "maintenance",
  "/analytics/sales": "analytics",
  "/analytics/finance": "analytics",
};

export const ROUTE_MODULES = {
  "/": "dashboard",
  "/masters": "production",
  "/production": "production",
  "/inventory": "inventory",
  "/procurement": "procurement",
  "/hr": "hr",
  "/sales": "sales",
  "/accounts": "accounts",
  "/finance": "accounts",
  "/quality": "quality",
  "/maintenance": "maintenance",
  "/analytics": "analytics",
  "/alerts": "alerts",
  "/admin": "admin",
  "/settings": "admin",
  "/documents": "documents",
  "/factory-monitor": "factoryMonitor",
  "/iot": "iot",
};

export function getModuleForPath(pathname) {
  const path = pathname.replace(/\/$/, "") || "/";
  if (ROUTE_MODULE_OVERRIDES[path]) return ROUTE_MODULE_OVERRIDES[path];
  const sorted = Object.keys(ROUTE_MODULES).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return ROUTE_MODULES[prefix];
    }
  }
  return "dashboard";
}

export function isAdmin(user) {
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  if (user.role === "Admin" || roles.includes("Admin")) return true;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  return perms.includes("admin") || perms.includes("*");
}

export function getEffectivePermissions(user) {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }
  const roles = Array.isArray(user.roles) && user.roles.length ? user.roles : [user.role];
  const merged = new Set();
  for (const role of roles) {
    (ROLE_PERMISSIONS[role] || []).forEach((p) => merged.add(p));
  }
  return [...merged];
}

export function userHasModule(user, module) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const perms = getEffectivePermissions(user);
  if (perms.includes(module) || perms.includes("*")) return true;
  return perms.some((p) => p.startsWith(`${module}:`));
}

export function userCanAction(user, module, action) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const perms = getEffectivePermissions(user);
  if (perms.includes("*")) return true;
  if (perms.includes(`${module}:${action}`) || perms.includes(`${module}:*`)) return true;
  const roles = new Set(Array.isArray(user.roles) ? user.roles : [user.role]);
  if ([...roles].some((r) => RESTRICTED_ACTION_ROLES.has(r))) return false;
  return perms.includes(module);
}

export function canAccess(userRole, module) {
  return userHasModule({ role: userRole, permissions: ROLE_PERMISSIONS[userRole] || [] }, module);
}

export function userCanAccess(user, module) {
  return userHasModule(user, module);
}

export function isOperator(user) {
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return user.role === "Operator" || roles.includes("Operator");
}
