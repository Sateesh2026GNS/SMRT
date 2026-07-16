/** Work order demo data and helpers. */

import { PRIORITIES, PRIORITY_COLORS, SHIFTS, DEPARTMENTS } from "./productionPlanningMasterData";

export { PRIORITIES, PRIORITY_COLORS, SHIFTS, DEPARTMENTS };

export const WO_STATUSES = [
  "draft", "released", "material_ready", "machine_ready",
  "running", "paused", "in_progress", "planned", "completed", "closed",
];

export const WO_STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-600",
  released: "bg-blue-100 text-blue-800",
  material_ready: "bg-cyan-100 text-cyan-800",
  machine_ready: "bg-indigo-100 text-indigo-800",
  running: "bg-green-100 text-green-800",
  in_progress: "bg-amber-100 text-amber-800",
  planned: "bg-blue-100 text-blue-700",
  paused: "bg-orange-100 text-orange-800",
  completed: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
};

export const WORKFLOW_STEPS = [
  "Sales Order",
  "Production Planning",
  "BOM Verification",
  "Material Issue",
  "Work Order",
  "Machine Allocation",
  "Operator Assignment",
  "Production Start",
  "Quality Check",
  "Finished Goods",
];

export const STATUS_FLOW = [
  "Draft", "Released", "Material Ready", "Machine Ready",
  "Running", "Paused", "Completed", "Closed",
];

export const DEMO_WO_SUMMARY = {
  total_work_orders: 0,
  planned_orders: 0,
  in_progress_orders: 0,
  completed_orders: 0,
  delayed_orders: 0,
  high_priority_orders: 0,
};

const CUSTOMERS = ["Tata Motors", "Bosch India", "Mahindra", "Ashok Leyland", "Hyundai"];
const PRODUCTS = ["Gear Housing", "Shaft Assembly", "Brake Drum", "Engine Block", "Transmission Case"];
const MACHINES = ["CNC Unit 1", "Lathe Unit 3", "Press Unit 5", "Milling Unit 2"];
const OPERATORS = ["Ravi Kumar", "Priya Sharma", "Suresh Reddy", "Anita Desai", "Vikram Singh"];

const STATUS_POOL = [
  "planned", "released", "material_ready", "machine_ready",
  "running", "running", "in_progress", "paused",
  "completed", "completed", "completed", "closed",
  "running", "planned", "running", "completed", "machine_ready", "running",
];

function buildWo(i) {
  const n = i + 1;
  const status = STATUS_POOL[i % STATUS_POOL.length];
  const planned = 400 + i * 80;
  const produced = ["completed", "closed"].includes(status) ? planned :
    ["running", "in_progress", "paused"].includes(status) ? Math.round(planned * (0.5 + (i % 5) * 0.08)) : 0;
  const remaining = Math.max(planned - produced, 0);
  const progress = planned ? Math.round((produced / planned) * 1000) / 10 : 0;
  const priority = PRIORITIES[i % 3];
  const isDelayed = i % 7 === 0 && !["completed", "closed"].includes(status);

  return {
    id: `demo-wo-${n}`,
    work_order_number: `WO-2026-${String(2000 + n)}`,
    production_order_id: n,
    production_order_number: `PO-2026-${String(1000 + n)}`,
    product_name: PRODUCTS[i % PRODUCTS.length],
    customer_name: CUSTOMERS[i % CUSTOMERS.length],
    bom_version: `BOM v${1 + (i % 3)}.0`,
    batch_number: produced > 0 ? `BATCH-${String(n).padStart(4, "0")}` : null,
    machine_id: (i % 4) + 1,
    machine_name: MACHINES[i % MACHINES.length],
    machine_code: `MCH${String((i % 8) + 1).padStart(3, "0")}`,
    machine_status: ["running", "in_progress", "paused"].includes(status) ? "running" : "idle",
    assigned_user_id: (i % 5) + 1,
    operator_name: OPERATORS[i % OPERATORS.length],
    supervisor: "Ramesh Gupta",
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    shift: SHIFTS[i % 3],
    planned_quantity: planned,
    produced_quantity: produced,
    actual_quantity: produced || null,
    remaining_quantity: remaining,
    scrap_quantity: produced > 0 ? Math.round(produced * 0.02) : 0,
    rework_quantity: produced > 0 ? Math.round(produced * 0.01) : 0,
    priority,
    planned_start: `2026-07-${String((i % 15) + 1).padStart(2, "0")}`,
    planned_end: `2026-07-${String((i % 15) + 12).padStart(2, "0")}`,
    status,
    progress_pct: progress,
    is_delayed: isDelayed,
    machine_efficiency_pct: status === "running" ? 82 + (i % 10) : null,
    machine_utilization_pct: status === "running" ? 75 + (i % 15) : null,
    operator_efficiency_pct: progress,
    oee_pct: status === "running" ? 68 + (i % 12) : null,
    production_efficiency_pct: progress,
    scrap_pct: produced ? 2.0 : 0,
    downtime_minutes: isDelayed ? 30 + i * 3 : 0,
    quality_status: status === "completed" ? "passed" : status === "running" ? "in_progress" : "pending",
    created_at: "2026-07-01T09:00:00",
    started_at: produced > 0 ? "2026-07-02T06:30:00" : null,
    paused_at: status === "paused" ? "2026-07-05T14:00:00" : null,
    completed_at: ["completed", "closed"].includes(status) ? "2026-07-10T18:00:00" : null,
    materials: [
      { component_name: "Steel Plate", required_qty: planned * 0.4, issued_qty: planned * 0.4, balance_qty: 0, unit: "kg" },
      { component_name: "Bearing Set", required_qty: planned * 0.05, issued_qty: planned * 0.05, balance_qty: 0, unit: "pcs" },
    ],
    documents: [{ name: "Job Card", type: "PDF" }, { name: "Routing Sheet", type: "PDF" }],
    audit_logs: [{ action: "WO Created", user: "Planner", timestamp: "2026-07-01 09:00" }],
  };
}

export const DEMO_WORK_ORDERS = [];

export function enrichApiWorkOrder(row, index = 0) {
  const planned = Number(row.planned_quantity || 0);
  const produced = Number(row.produced_quantity ?? row.actual_quantity ?? 0);
  const remaining = Number(row.remaining_quantity ?? Math.max(planned - produced, 0));
  const progress = Number(row.progress_pct ?? (planned ? Math.round((produced / planned) * 1000) / 10 : 0));
  return {
    ...row,
    work_order_number: row.work_order_number || `WO-${row.id || index + 1}`,
    product_name: row.product_name || "—",
    customer_name: row.customer_name || "—",
    production_order_number: row.production_order_number || `PO-${row.production_order_id}`,
    machine_name: row.machine_name || "—",
    machine_status: row.machine_status || "—",
    operator_name: row.operator_name || "—",
    priority: row.priority || "medium",
    planned_quantity: planned,
    produced_quantity: produced,
    remaining_quantity: remaining,
    progress_pct: progress,
    materials: row.materials || [],
    documents: row.documents || [],
    audit_logs: row.audit_logs || [],
  };
}

export function computeWorkOrderSummary(orders) {
  const counts = { planned: 0, in_progress: 0, completed: 0, delayed: 0, high: 0 };
  orders.forEach((o) => {
    const s = o.status;
    if (["completed", "closed", "done"].includes(s)) counts.completed += 1;
    else if (["running", "in_progress", "paused"].includes(s)) counts.in_progress += 1;
    else counts.planned += 1;
    if (o.is_delayed) counts.delayed += 1;
    if (o.priority === "high") counts.high += 1;
  });
  return {
    total_work_orders: orders.length,
    planned_orders: counts.planned,
    in_progress_orders: counts.in_progress,
    completed_orders: counts.completed,
    delayed_orders: counts.delayed,
    high_priority_orders: counts.high,
  };
}

export function woStatusLabel(status) {
  return (status || "planned").replace(/_/g, " ");
}

export function canWoStart(status) {
  return ["draft", "released", "planned", "material_ready", "machine_ready", "pending"].includes(status);
}

export function canWoPause(status) {
  return ["running", "in_progress"].includes(status);
}

export function canWoStop(status) {
  return ["running", "in_progress", "paused"].includes(status);
}

export function canWoComplete(status) {
  return ["running", "in_progress", "paused", "quality_check"].includes(status);
}

export function priorityBadge(priority) {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
}
