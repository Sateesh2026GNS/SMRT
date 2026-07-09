/** Production planning demo data and helpers. */

export const ORDER_STATUSES = [
  "draft", "planned", "material_ready", "machine_assigned",
  "in_progress", "quality_check", "completed", "closed", "delayed", "cancelled",
];

export const PRIORITIES = ["high", "medium", "low"];

export const PRIORITY_COLORS = {
  high: { dot: "🔴", bg: "bg-red-100", text: "text-red-800", label: "High" },
  medium: { dot: "🟡", bg: "bg-yellow-100", text: "text-yellow-800", label: "Medium" },
  low: { dot: "🟢", bg: "bg-green-100", text: "text-green-800", label: "Low" },
};

export const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-600",
  planned: "bg-blue-100 text-blue-800",
  material_ready: "bg-cyan-100 text-cyan-800",
  machine_assigned: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-amber-100 text-amber-800",
  quality_check: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  closed: "bg-slate-200 text-slate-700",
  delayed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
  pending: "bg-blue-100 text-blue-800",
};

export const SHIFTS = ["Shift A", "Shift B", "Shift C"];
export const DEPARTMENTS = ["Production", "Packing", "Assembly", "Quality Control"];

export const WORKFLOW_STEPS = [
  "Sales Order",
  "Production Planning",
  "BOM Verification",
  "Material Availability Check",
  "Work Order",
  "Machine Allocation",
  "Production Start",
  "Quality Inspection",
  "Finished Goods",
  "Inventory Update",
];

export const STATUS_FLOW = [
  "Draft", "Planned", "Material Ready", "Machine Assigned",
  "In Progress", "Quality Check", "Completed", "Closed",
];

export const IMPORT_TEMPLATE_HEADERS = [
  "order_number", "product", "customer", "planned_quantity", "priority",
  "department", "shift", "start_date", "due_date", "status",
];

const CUSTOMERS = ["Tata Motors", "Bosch India", "Mahindra", "Ashok Leyland", "Hyundai", "Maruti Suzuki"];
const PRODUCTS = ["Gear Housing", "Shaft Assembly", "Brake Drum", "Engine Block", "Transmission Case", "Wheel Hub"];
const MACHINES = ["CNC Unit 1", "Lathe Unit 3", "Press Unit 5", "Milling Unit 2", "Assembly Line A"];
const OPERATORS = ["Ravi Kumar", "Priya Sharma", "Suresh Reddy", "Anita Desai", "Vikram Singh"];

const STATUS_POOL = [
  "planned", "planned", "material_ready", "machine_assigned",
  "in_progress", "in_progress", "in_progress", "quality_check",
  "completed", "completed", "completed", "completed",
  "delayed", "cancelled", "draft", "planned", "in_progress", "completed",
];

function buildOrder(i) {
  const n = i + 1;
  const status = STATUS_POOL[i % STATUS_POOL.length];
  const planned = 500 + (i * 120);
  const produced = status === "completed" || status === "closed" ? planned :
    status === "in_progress" || status === "quality_check" ? Math.round(planned * (0.55 + (i % 4) * 0.1)) :
    status === "delayed" ? Math.round(planned * 0.35) : 0;
  const balance = Math.max(planned - produced, 0);
  const progress = planned ? Math.round((produced / planned) * 1000) / 10 : 0;
  const priority = PRIORITIES[i % 3];
  const start = `2026-07-${String((i % 20) + 1).padStart(2, "0")}`;
  const due = `2026-07-${String((i % 20) + 10).padStart(2, "0")}`;

  return {
    id: `demo-${n}`,
    order_number: `PO-2026-${String(1000 + n)}`,
    product_id: (i % 6) + 1,
    product_name: PRODUCTS[i % PRODUCTS.length],
    customer_name: CUSTOMERS[i % CUSTOMERS.length],
    sales_order_number: `SO-2026-${String(500 + n)}`,
    bom_version: `BOM v${1 + (i % 3)}.${i % 5}`,
    work_order_number: `WO-2026-${String(2000 + n)}`,
    batch_number: status !== "draft" && status !== "planned" ? `BATCH-${String(n).padStart(4, "0")}` : null,
    planned_quantity: planned,
    produced_quantity: produced,
    balance_quantity: balance,
    scrap_quantity: produced > 0 ? Math.round(produced * 0.02) : 0,
    priority,
    machine_name: MACHINES[i % MACHINES.length],
    machine_code: `MCH${String((i % 8) + 1).padStart(3, "0")}`,
    machine_status: status === "in_progress" ? "running" : "idle",
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    shift: SHIFTS[i % 3],
    operator_name: OPERATORS[i % OPERATORS.length],
    supervisor: "Ramesh Gupta",
    start_date: start,
    due_date: due,
    status,
    progress_pct: progress,
    is_delayed: status === "delayed" || (status === "in_progress" && i % 5 === 0),
    machine_utilization_pct: status === "in_progress" ? 75 + (i % 20) : 0,
    operator_efficiency_pct: produced && planned ? Math.round((produced / planned) * 100) : 0,
    scrap_pct: produced ? 2.1 : 0,
    production_efficiency_pct: progress,
    downtime_minutes: status === "delayed" ? 45 + i * 5 : i % 4 === 0 ? 15 : 0,
    oee_pct: status === "in_progress" ? 68 + (i % 15) : null,
    quality_status: status === "completed" ? "passed" : status === "quality_check" ? "in_progress" : "pending",
    materials: [
      { component_name: "Steel Plate", required_qty: planned * 0.5, available_qty: planned * 0.8, issued_qty: planned * 0.5, balance_qty: 0, unit: "kg" },
      { component_name: "Bearing Set", required_qty: planned * 0.1, available_qty: planned * 0.15, issued_qty: planned * 0.1, balance_qty: 0, unit: "pcs" },
    ],
    work_orders: [
      { id: n, work_order_number: `WO-2026-${2000 + n}`, status, planned_quantity: planned, actual_quantity: produced, machine_name: MACHINES[i % MACHINES.length] },
    ],
    documents: [{ name: "Job Card", type: "PDF" }, { name: "BOM Sheet", type: "PDF" }],
    audit_logs: [{ action: "Order Created", user: "Planner", timestamp: "2026-07-01 09:00" }],
  };
}

export const DEMO_PRODUCTION_ORDERS = Array.from({ length: 18 }, (_, i) => buildOrder(i));

export const DEMO_SUMMARY = {
  total_orders: 120,
  planned_orders: 18,
  in_progress_orders: 35,
  completed_orders: 62,
  delayed_orders: 5,
  cancelled_orders: 3,
  todays_target: 5200,
  todays_production: 4180,
};

export function enrichApiOrder(row, index = 0) {
  const planned = Number(row.planned_quantity || 0);
  const produced = Number(row.produced_quantity ?? 0);
  const balance = Number(row.balance_quantity ?? Math.max(planned - produced, 0));
  const progress = Number(row.progress_pct ?? (planned ? Math.round((produced / planned) * 1000) / 10 : 0));
  return {
    ...row,
    order_number: row.order_number || `PO-${row.id || index + 1}`,
    product_name: row.product_name || `Product #${row.product_id}`,
    customer_name: row.customer_name || "—",
    priority: row.priority || "medium",
    bom_version: row.bom_version || "BOM v1.0",
    work_order_number: row.work_order_number || null,
    machine_name: row.machine_name || "—",
    department: row.department || "Production",
    shift: row.shift || "Shift A",
    planned_quantity: planned,
    produced_quantity: produced,
    balance_quantity: balance,
    progress_pct: progress,
    is_delayed: row.is_delayed ?? false,
    materials: row.materials || [],
    work_orders: row.work_orders || [],
    documents: row.documents || [],
    audit_logs: row.audit_logs || [],
  };
}

export function computePlanningSummary(orders) {
  const counts = { planned: 0, in_progress: 0, completed: 0, delayed: 0, cancelled: 0 };
  let todaysProduction = 0;
  orders.forEach((o) => {
    const s = o.status;
    if (s === "cancelled") counts.cancelled += 1;
    else if (["completed", "closed", "done"].includes(s)) counts.completed += 1;
    else if (["in_progress", "running", "quality_check"].includes(s)) counts.in_progress += 1;
    else if (["draft", "planned", "pending", "material_ready", "machine_assigned"].includes(s)) counts.planned += 1;
    if (o.is_delayed || s === "delayed") counts.delayed += 1;
    todaysProduction += Number(o.produced_quantity || 0);
  });
  const todaysTarget = orders.reduce((s, o) => s + Number(o.planned_quantity || 0), 0);
  return {
    total_orders: orders.length,
    planned_orders: counts.planned,
    in_progress_orders: counts.in_progress,
    completed_orders: counts.completed,
    delayed_orders: counts.delayed,
    cancelled_orders: counts.cancelled,
    todays_target: todaysTarget,
    todays_production: todaysProduction,
  };
}

export function priorityBadge(priority) {
  const p = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  return p;
}

export function statusLabel(status) {
  return (status || "planned").replace(/_/g, " ");
}

export function canStart(status) {
  return ["draft", "planned", "pending", "material_ready", "machine_assigned"].includes(status);
}

export function canPause(status) {
  return ["in_progress", "running"].includes(status);
}

export function canComplete(status) {
  return ["in_progress", "running", "quality_check"].includes(status);
}
