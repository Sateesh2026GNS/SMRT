/** Production hub demo data. */

export const DEMO_HUB = {
  running_jobs: 12,
  machines_running: 8,
  machines_idle: 5,
  machines_down: 2,
  production_in_progress: 18,
  production_completed_today: 6,
  material_shortages: 2,
  material_available: 15,
  operators_present: 42,
  operators_absent: 3,
  quality_passed: 28,
  quality_failed: 2,
  recent_jobs: [
    { work_order_number: "WO-1001", product: "Chair", machine: "CNC-01", status: "running", progress_pct: 65 },
    { work_order_number: "WO-1002", product: "Table", machine: "CNC-02", status: "running", progress_pct: 30 },
    { work_order_number: "WO-1003", product: "Steel Frame", machine: "Unassigned", status: "planned", progress_pct: 0 },
  ],
  machine_status: [
    { name: "CNC-01", status: "running", code: "M-01" },
    { name: "CNC-02", status: "running", code: "M-02" },
    { name: "CNC-03", status: "breakdown", code: "M-03" },
    { name: "CNC-04", status: "idle", code: "M-04" },
    { name: "CNC-05", status: "idle", code: "M-05" },
  ],
};

export const HUB_MODULES = [
  { label: "Production Planning", to: "/production/planning", color: "bg-blue-500" },
  { label: "Schedule", to: "/production/schedule", color: "bg-indigo-500" },
  { label: "Machine Allocation", to: "/production/tasks", color: "bg-violet-500" },
  { label: "Shop Floor", to: "/factory-monitor/live-production", color: "bg-teal-500" },
  { label: "Batch Tracking", to: "/production/batches", color: "bg-amber-500" },
  { label: "Quality", to: "/quality/inspection", color: "bg-green-500" },
  { label: "Finished Goods", to: "/inventory/finished-goods", color: "bg-emerald-500" },
];

export const HUB_FLOW = [
  "Production Planning", "Work Orders", "Production Schedule",
  "Machine Allocation", "Shop Floor", "Production Entry",
  "Batch Tracking", "Quality Control", "Finished Goods Inventory",
];

export function hubStatusColor(status) {
  if (status === "ok" || status === "running" || status === "passed") return "text-green-600";
  if (status === "warning" || status === "idle") return "text-amber-600";
  return "text-red-600";
}
