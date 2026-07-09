/** Warehouse master demo data and helpers. */

export const WAREHOUSE_STATUSES = ["active", "inactive"];
export const WAREHOUSE_TYPES = [
  "Raw Material",
  "Finished Goods",
  "WIP",
  "General",
  "Distribution",
  "Transit",
];
export const BRANCHES = ["Hyderabad", "Chennai", "Pune", "Bengaluru"];
export const PLANTS = ["Plant A — Hyderabad", "Plant B — Chennai", "Plant C — Pune"];

export const WORKFLOW_STEPS = [
  "Purchase",
  "Raw Material Warehouse",
  "Production",
  "Finished Goods Warehouse",
  "Sales",
  "Dispatch",
];

export const TRANSFER_WORKFLOW = [
  "Warehouse A",
  "Warehouse B",
  "Approval",
  "Stock Updated",
];

export const REPORT_TYPES = [
  "Stock Report",
  "Warehouse Utilization",
  "Inventory Valuation",
  "Stock Aging",
  "Bin-wise Stock",
  "Movement Report",
];

export const IMPORT_TEMPLATE_HEADERS = [
  "code", "name", "branch", "plant", "warehouse_type", "state", "manager_name", "capacity", "status",
];

export const DEMO_WAREHOUSES = [
  {
    id: "demo-1",
    code: "WH-HYD-01",
    name: "Main Raw Material Store",
    branch: "Hyderabad",
    plant: "Plant A — Hyderabad",
    warehouse_type: "Raw Material",
    state: "Telangana",
    city: "Hyderabad",
    address: "IDA Uppal, Hyderabad",
    manager_name: "Ravi Kumar",
    manager_phone: "+91 98765 10001",
    capacity: 50000,
    used_capacity: 36200,
    available_capacity: 13800,
    utilization_pct: 72.4,
    inventory_value: 28500000,
    item_count: 156,
    low_stock_items: 8,
    is_primary: true,
    status: "active",
    rack_count: 12,
    bin_count: 48,
    raw_materials: 120,
    finished_goods: 0,
    wip_items: 36,
    total_items: 156,
    low_stock: 8,
    out_of_stock: 2,
    daily_inward: 1250,
    daily_outward: 980,
    stock_turnover: 4.2,
    fast_moving: 42,
    slow_moving: 18,
    dead_stock: 5,
    created_at: "2023-01-15",
  },
  {
    id: "demo-2",
    code: "WH-HYD-02",
    name: "Finished Goods Store",
    branch: "Hyderabad",
    plant: "Plant A — Hyderabad",
    warehouse_type: "Finished Goods",
    state: "Telangana",
    city: "Hyderabad",
    manager_name: "Anita Sharma",
    manager_phone: "+91 91234 20002",
    capacity: 30000,
    used_capacity: 21600,
    available_capacity: 8400,
    utilization_pct: 72,
    inventory_value: 18500000,
    item_count: 85,
    low_stock_items: 3,
    is_primary: false,
    status: "active",
    rack_count: 8,
    bin_count: 32,
    created_at: "2023-03-20",
  },
  {
    id: "demo-3",
    code: "WH-CHN-01",
    name: "Chennai Production Store",
    branch: "Chennai",
    plant: "Plant B — Chennai",
    warehouse_type: "WIP",
    state: "Tamil Nadu",
    city: "Chennai",
    manager_name: "Suresh Reddy",
    manager_phone: "+91 99887 30003",
    capacity: 25000,
    used_capacity: 17500,
    utilization_pct: 70,
    inventory_value: 9200000,
    item_count: 62,
    low_stock_items: 5,
    is_primary: false,
    status: "active",
    created_at: "2024-02-10",
  },
  {
    id: "demo-4",
    code: "WH-PUN-01",
    name: "Pune Distribution Center",
    branch: "Pune",
    plant: "Plant C — Pune",
    warehouse_type: "Distribution",
    state: "Maharashtra",
    city: "Pune",
    manager_name: "Priya Nair",
    manager_phone: "+91 97654 40004",
    capacity: 40000,
    used_capacity: 28800,
    utilization_pct: 72,
    inventory_value: 15200000,
    item_count: 98,
    low_stock_items: 0,
    is_primary: false,
    status: "active",
    created_at: "2024-06-01",
  },
  {
    id: "demo-5",
    code: "WH-HYD-03",
    name: "Consumables Store",
    branch: "Hyderabad",
    plant: "Plant A — Hyderabad",
    warehouse_type: "General",
    state: "Telangana",
    city: "Hyderabad",
    manager_name: "Vikram Singh",
    manager_phone: "+91 96543 50005",
    capacity: 10000,
    used_capacity: 6500,
    utilization_pct: 65,
    inventory_value: 2100000,
    item_count: 45,
    low_stock_items: 6,
    is_primary: false,
    status: "active",
    created_at: "2024-08-15",
  },
  {
    id: "demo-6",
    code: "WH-BLR-01",
    name: "Bengaluru Transit Hub",
    branch: "Bengaluru",
    plant: "Plant C — Pune",
    warehouse_type: "Transit",
    state: "Karnataka",
    city: "Bengaluru",
    manager_name: "Karthik Rao",
    manager_phone: "+91 95432 60006",
    capacity: 15000,
    used_capacity: 4200,
    utilization_pct: 28,
    inventory_value: 3800000,
    item_count: 22,
    low_stock_items: 1,
    is_primary: false,
    status: "active",
    created_at: "2025-01-10",
  },
  {
    id: "demo-7",
    code: "WH-HYD-04",
    name: "Rejected / Damaged Stock",
    branch: "Hyderabad",
    plant: "Plant A — Hyderabad",
    warehouse_type: "General",
    state: "Telangana",
    city: "Hyderabad",
    manager_name: "Ravi Kumar",
    manager_phone: "+91 98765 10001",
    capacity: 5000,
    used_capacity: 1200,
    utilization_pct: 24,
    inventory_value: 450000,
    item_count: 12,
    low_stock_items: 0,
    is_primary: false,
    status: "inactive",
    created_at: "2025-03-01",
  },
  {
    id: "demo-8",
    code: "WH-CHN-02",
    name: "Chennai FG Dispatch",
    branch: "Chennai",
    plant: "Plant B — Chennai",
    warehouse_type: "Finished Goods",
    state: "Tamil Nadu",
    city: "Chennai",
    manager_name: "Meena Iyer",
    manager_phone: "+91 94321 70007",
    capacity: 20000,
    used_capacity: 15800,
    utilization_pct: 79,
    inventory_value: 11200000,
    item_count: 55,
    low_stock_items: 2,
    is_primary: false,
    status: "active",
    created_at: "2026-07-01",
  },
];

export const DEMO_BIN_TREE = [
  {
    name: "Rack A",
    type: "rack",
    children: [
      {
        name: "Shelf 01",
        type: "shelf",
        children: [
          { name: "Bin A01", type: "bin" },
          { name: "Bin A02", type: "bin" },
        ],
      },
    ],
  },
  {
    name: "Rack B",
    type: "rack",
    children: [
      {
        name: "Shelf 01",
        type: "shelf",
        children: [{ name: "Bin B01", type: "bin" }],
      },
    ],
  },
];

export function enrichApiWarehouse(row, index = 0) {
  const used = row.used_capacity ?? 0;
  const cap = row.capacity ?? 0;
  return {
    ...row,
    code: row.code || `WH-${String(index + 1).padStart(2, "0")}`,
    name: row.name || "Unnamed Warehouse",
    branch: row.branch || "—",
    plant: row.plant || "—",
    warehouse_type: row.warehouse_type || "General",
    manager_name: row.manager_name || "—",
    manager_phone: row.manager_phone || "—",
    status: row.status || "active",
    used_capacity: used,
    available_capacity: row.available_capacity ?? (cap ? cap - used : null),
    utilization_pct: row.utilization_pct ?? (cap ? Math.round((used / cap) * 1000) / 10 : null),
    inventory_value: row.inventory_value ?? 0,
    item_count: row.item_count ?? 0,
    low_stock_items: row.low_stock_items ?? 0,
    created_at: row.created_at?.slice?.(0, 10) || new Date().toISOString().slice(0, 10),
  };
}

export function computeWarehouseSummary(warehouses) {
  const active = warehouses.filter((w) => w.status === "active");
  const totalCap = warehouses.reduce((s, w) => s + (w.capacity || 0), 0);
  const totalUsed = warehouses.reduce((s, w) => s + (w.used_capacity || 0), 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    total: warehouses.length,
    active: active.length,
    inactive: warehouses.length - active.length,
    primary: warehouses.find((w) => w.is_primary)?.name || active[0]?.name || "—",
    utilizationPct: totalCap ? Math.round((totalUsed / totalCap) * 1000) / 10 : 0,
    inventoryValue: warehouses.reduce((s, w) => s + Number(w.inventory_value || 0), 0),
    lowStockWarehouses: warehouses.filter((w) => (w.low_stock_items || 0) > 0).length,
    pendingTransfers: 3,
    newThisMonth: warehouses.filter((w) => new Date(w.created_at) >= monthStart).length,
  };
}

export function formatCr(value) {
  const n = Number(value || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
