/** Shop floor demo data. */

export const DEMO_SHOP_SUMMARY = {
  running_jobs: 12,
  active_machines: 8,
  operators_working: 45,
  todays_production: 8450,
  todays_target: 12500,
  scrap_qty: 120,
  downtime_minutes: 45,
  oee_pct: 82.3,
};

export const DEMO_SHOP_GRID = [
  { machine_id: "sf-m1", machine_name: "CNC-01", work_order_id: "sf-wo1", work_order_number: "WO-1001", product_name: "Chair", operator_name: "Ravi Kumar", shift: "Morning", progress_pct: 65, status: "running" },
  { machine_id: "sf-m2", machine_name: "CNC-02", work_order_id: "sf-wo2", work_order_number: "WO-1002", product_name: "Table", operator_name: "Mahesh Patel", shift: "Evening", progress_pct: 30, status: "running" },
  { machine_id: "sf-m3", machine_name: "CNC-03", work_order_id: null, work_order_number: null, product_name: null, operator_name: null, shift: null, progress_pct: 0, status: "idle" },
  { machine_id: "sf-m4", machine_name: "CNC-04", work_order_id: "sf-wo4", work_order_number: "WO-1004", product_name: "Frame", operator_name: "Suresh Reddy", shift: "Morning", progress_pct: 15, status: "running" },
  { machine_id: "sf-m5", machine_name: "CNC-05", work_order_id: null, work_order_number: null, product_name: null, operator_name: null, shift: null, progress_pct: 0, status: "maintenance" },
];

export const DEMO_SHOP_ALERTS = [
  { alert_type: "machine_breakdown", message: "Machine-03 Breakdown", severity: "error" },
  { alert_type: "material_shortage", message: "Material Shortage", severity: "warning" },
  { alert_type: "quality_failed", message: "Quality Failed", severity: "warning" },
  { alert_type: "operator_absent", message: "Operator Absent", severity: "warning" },
];

export const DEMO_MACHINE_LAYOUT = [
  { id: "sf-m1", name: "Machine 1", status: "running" },
  { id: "sf-m2", name: "Machine 2", status: "running" },
  { id: "sf-m3", name: "Machine 3", status: "breakdown" },
  { id: "sf-m4", name: "Machine 4", status: "idle" },
  { id: "sf-m5", name: "Machine 5", status: "idle" },
];

export const DEMO_SHOP_TIMELINE = [
  { slot: "08 AM", label: "Chair", product_name: "Chair", span_slots: 3 },
  { slot: "10 AM", label: "Table", product_name: "Table", span_slots: 2 },
  { slot: "12 PM", label: "Frame", product_name: "Steel Frame", span_slots: 3 },
];

export const SHOP_FLOW_STEPS = [
  "Sales Order", "Production Planning", "Production Schedule",
  "Machine Allocation", "Shop Floor", "Production Entry",
  "Batch Tracking", "Quality Control", "Finished Goods Inventory",
];

export function shopStatusDot(status) {
  const s = (status || "").toLowerCase();
  if (s === "running") return "🟢";
  if (s === "idle") return "🟡";
  if (s === "maintenance" || s === "breakdown") return "🔴";
  return "⚪";
}

export function shopStatusLabel(status) {
  const s = (status || "").toLowerCase();
  if (s === "running") return "Running";
  if (s === "idle") return "Idle";
  if (s === "maintenance") return "Maintenance";
  if (s === "breakdown") return "Breakdown";
  return status || "—";
}
