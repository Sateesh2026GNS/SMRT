/** Production schedule demo data and helpers. */

import { PRIORITIES, PRIORITY_COLORS } from "./productionPlanningMasterData";

export { PRIORITIES, PRIORITY_COLORS };

export const TIMELINE_SLOTS = ["08AM", "10AM", "12PM", "02PM", "04PM", "06PM"];

export const SCHEDULE_FLOW_STEPS = [
  "Sales Order",
  "Production Planning",
  "Production Schedule",
  "Machine Allocation",
  "Material Issue",
  "Shop Floor",
  "Quality",
  "Finished Goods",
  "Inventory",
];

export const KANBAN_COLUMNS = [
  { id: "planned", label: "Planned", color: "bg-slate-100 border-slate-300" },
  { id: "ready", label: "Ready", color: "bg-blue-50 border-blue-300" },
  { id: "running", label: "Running", color: "bg-green-50 border-green-300" },
  { id: "quality", label: "Quality", color: "bg-amber-50 border-amber-300" },
  { id: "completed", label: "Completed", color: "bg-emerald-50 border-emerald-300" },
];

export const CONFLICT_LABELS = {
  machine_busy: "Machine Already Busy",
  operator_assigned: "Operator Already Assigned",
  material_unavailable: "Material Not Available",
  holiday: "Holiday",
};

export const DEMO_DASHBOARD = {
  today: "2026-07-09",
  production_target: 12500,
  completed: 8450,
  pending: 4050,
  overall_progress_pct: 68,
  machine_utilization_pct: 84,
  operators_present: 126,
  delayed_orders: 3,
  material_shortage: 2,
};

export const DEMO_TIMELINE = [
  {
    machine_id: "demo-m1",
    machine_name: "Machine-01",
    machine_code: "M-01",
    status: "running",
    job_label: "Chair Production",
    work_order_id: "demo-wo-1",
    work_order_number: "WO-1023",
    start_slot: 0,
    span_slots: 4,
  },
  {
    machine_id: "demo-m2",
    machine_name: "Machine-02",
    machine_code: "M-02",
    status: "idle",
    job_label: "Table Production",
    work_order_id: "demo-wo-2",
    work_order_number: "WO-1024",
    start_slot: 0,
    span_slots: 2,
  },
  {
    machine_id: "demo-m3",
    machine_name: "Machine-03",
    machine_code: "M-03",
    status: "running",
    job_label: "Steel Frame",
    work_order_id: "demo-wo-3",
    work_order_number: "WO-1025",
    start_slot: 1,
    span_slots: 3,
  },
  {
    machine_id: "demo-m4",
    machine_name: "Machine-04",
    machine_code: "M-04",
    status: "idle",
    job_label: "Idle",
    work_order_id: null,
    work_order_number: null,
    start_slot: 0,
    span_slots: 0,
  },
  {
    machine_id: "demo-m5",
    machine_name: "Machine-05",
    machine_code: "M-05",
    status: "maintenance",
    job_label: "Maintenance",
    work_order_id: null,
    work_order_number: null,
    start_slot: 0,
    span_slots: 6,
  },
];

export const DEMO_SHIFTS = [
  {
    shift_name: "Morning Shift",
    machine_name: "Machine 01",
    operator_name: "Ravi Kumar",
    product_name: "Chair",
    quantity: 1000,
    status: "running",
  },
  {
    shift_name: "Afternoon Shift",
    machine_name: "Machine 02",
    operator_name: "Mahesh Patel",
    product_name: "Table",
    quantity: 700,
    status: "planned",
  },
  {
    shift_name: "Night Shift",
    machine_name: "Machine 03",
    operator_name: "Suresh Reddy",
    product_name: "Steel Frame",
    quantity: 500,
    status: "planned",
  },
];

export const DEMO_LIVE_MACHINES = [
  { machine_id: "demo-m1", machine_name: "Machine 01", machine_code: "M-01", status: "running", job: "WO-1023", progress_pct: 45 },
  { machine_id: "demo-m2", machine_name: "Machine 02", machine_code: "M-02", status: "idle", job: null, progress_pct: 0 },
  { machine_id: "demo-m3", machine_name: "Machine 03", machine_code: "M-03", status: "breakdown", job: "WO-1025", progress_pct: 0 },
];

export const DEMO_QUEUE = [
  { position: 1, work_order_id: "demo-wo-1", work_order_number: "WO-1023", product_name: "Chair", quantity: 1000, priority: "high", machine_id: "demo-m1" },
  { position: 2, work_order_id: "demo-wo-2", work_order_number: "WO-1024", product_name: "Table", quantity: 700, priority: "medium", machine_id: "demo-m2" },
  { position: 3, work_order_id: "demo-wo-3", work_order_number: "WO-1025", product_name: "Steel Frame", quantity: 500, priority: "low", machine_id: "demo-m3" },
];

export const DEMO_MATERIALS = [
  { product_name: "Chair", material_status: "available", available: true },
  { product_name: "Table", material_status: "shortage", available: false },
  { product_name: "Steel Frame", material_status: "available", available: true },
];

export const DEMO_CONFLICTS = [
  { conflict_type: "machine_busy", message: "Machine-02 has overlapping jobs", severity: "warning" },
  { conflict_type: "operator_assigned", message: "Mahesh Patel assigned to 2 jobs", severity: "warning" },
  { conflict_type: "material_unavailable", message: "Material shortage for Table", severity: "warning" },
  { conflict_type: "holiday", message: "Plant holiday on 15-Jul-2026", severity: "info" },
];

export const DEMO_BOTTOM_KPIS = {
  todays_production: 8450,
  pending_orders: 4050,
  machine_efficiency_pct: 84,
  shift_efficiency_pct: 78.5,
  downtime_minutes: 45,
  power_kwh: 1240.5,
  oee_pct: 82.3,
  quality_rate_pct: 96.8,
};

export const DEMO_CALENDAR_EVENTS = [
  { id: 1, title: "PO-2026-1001 - Chair", order_number: "PO-2026-1001", status: "running", start: "2026-07-09", end: "2026-07-11", planned_quantity: 1000, product: "Chair" },
  { id: 2, title: "PO-2026-1002 - Table", order_number: "PO-2026-1002", status: "planned", start: "2026-07-09", end: "2026-07-10", planned_quantity: 700, product: "Table" },
  { id: 3, title: "PO-2026-1003 - Steel Frame", order_number: "PO-2026-1003", status: "planned", start: "2026-07-10", end: "2026-07-12", planned_quantity: 500, product: "Steel Frame" },
  { id: 4, title: "PO-2026-1004 - Cabinet", order_number: "PO-2026-1004", status: "completed", start: "2026-07-07", end: "2026-07-08", planned_quantity: 300, product: "Cabinet" },
];

export const DEMO_KANBAN = {
  planned: [
    { id: "k1", work_order_number: "WO-1030", product_name: "Desk", quantity: 400, priority: "medium", machine_name: "Machine-04" },
    { id: "k2", work_order_number: "WO-1031", product_name: "Shelf", quantity: 250, priority: "low", machine_name: "Unassigned" },
  ],
  ready: [
    { id: "k3", work_order_number: "WO-1024", product_name: "Table", quantity: 700, priority: "medium", machine_name: "Machine-02" },
  ],
  running: [
    { id: "k4", work_order_number: "WO-1023", product_name: "Chair", quantity: 1000, priority: "high", machine_name: "Machine-01" },
  ],
  quality: [
    { id: "k5", work_order_number: "WO-1020", product_name: "Bracket", quantity: 600, priority: "medium", machine_name: "Machine-06" },
  ],
  completed: [
    { id: "k6", work_order_number: "WO-1015", product_name: "Cabinet", quantity: 300, priority: "low", machine_name: "Machine-07" },
    { id: "k7", work_order_number: "WO-1012", product_name: "Panel", quantity: 800, priority: "medium", machine_name: "Machine-08" },
  ],
};

export const DEMO_TABLE_ROWS = [
  { id: "s1", schedule_id: "SCH-001", work_order_number: "WO-1023", product_name: "Chair", machine_name: "Machine-01", operator_name: "Ravi Kumar", shift: "Morning", start: "08:00", end: "14:00", quantity: 1000, status: "running", priority: "high" },
  { id: "s2", schedule_id: "SCH-002", work_order_number: "WO-1024", product_name: "Table", machine_name: "Machine-02", operator_name: "Mahesh Patel", shift: "Afternoon", start: "14:00", end: "18:00", quantity: 700, status: "planned", priority: "medium" },
  { id: "s3", schedule_id: "SCH-003", work_order_number: "WO-1025", product_name: "Steel Frame", machine_name: "Machine-03", operator_name: "Suresh Reddy", shift: "Night", start: "18:00", end: "06:00", quantity: 500, status: "breakdown", priority: "low" },
  { id: "s4", schedule_id: "SCH-004", work_order_number: "WO-1030", product_name: "Desk", machine_name: "Machine-04", operator_name: "Priya Sharma", shift: "Morning", start: "08:00", end: "12:00", quantity: 400, status: "planned", priority: "medium" },
];

export const DEMO_RESOURCE = {
  machine: "CNC-01",
  operator: "Mahesh Patel",
  shift: "Morning",
  supervisor: "Ramesh Kumar",
};

export function priorityBadge(priority) {
  const p = (priority || "medium").toLowerCase();
  const colors = PRIORITY_COLORS[p] || PRIORITY_COLORS.medium;
  return { label: p.charAt(0).toUpperCase() + p.slice(1), ...colors };
}

export function machineStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "running") return "text-green-600 bg-green-100";
  if (s === "idle") return "text-amber-600 bg-amber-100";
  if (s === "breakdown" || s === "maintenance") return "text-red-600 bg-red-100";
  return "text-slate-600 bg-slate-100";
}

export function machineStatusDot(status) {
  const s = (status || "").toLowerCase();
  if (s === "running") return "🟢";
  if (s === "idle") return "🟡";
  return "🔴";
}

export function formatScheduleDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function mergeTimeline(apiRows, demoRows) {
  if (apiRows?.length) return apiRows;
  return demoRows;
}

export function buildTableFromTimeline(timeline, shifts) {
  if (!timeline?.length) return DEMO_TABLE_ROWS;
  return timeline
    .filter((r) => r.work_order_id)
    .map((r, i) => {
      const shift = shifts?.[i % (shifts?.length || 1)];
      return {
        id: `api-${r.work_order_id}`,
        schedule_id: `SCH-${String(100 + i).padStart(3, "0")}`,
        work_order_number: r.work_order_number,
        product_name: r.job_label,
        machine_name: r.machine_name,
        operator_name: shift?.operator_name || "—",
        shift: shift?.shift_name || "—",
        start: "08:00",
        end: "18:00",
        quantity: shift?.quantity || 0,
        status: r.status,
        priority: "medium",
      };
    });
}
