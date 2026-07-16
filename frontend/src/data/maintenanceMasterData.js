/** Maintenance demo data and helpers. */

export const MAINTENANCE_FLOW = [
  "Machine Registration", "Preventive Schedule", "Maintenance Reminder",
  "Maintenance Execution", "Machine Inspection", "Machine History Updated", "Reports",
];

export const WORK_ORDER_FLOW = [
  "Reported", "Assigned", "In Progress", "Completed", "Verified", "Closed",
];

export const HISTORY_TIMELINE = [
  "Machine Installed", "Preventive Maintenance", "Breakdown", "Repair", "Calibration", "Replacement Parts",
];

export const DEMO_PREVENTIVE_SUMMARY = {
  total_machines: 24, scheduled_today: 5, overdue_tasks: 3, completed_this_month: 18,
  upcoming_maintenance: 12, machine_availability_pct: 92.5,
};

export const DEMO_PREVENTIVE_LIST = [
  { id: 1, machine_id: "CNC-01", machine_name: "CNC Milling Center", department: "Production", maintenance_type: "Preventive", scheduled_date: "2026-07-09", assigned_engineer: "Mahesh Patel", estimated_duration: "2h", status: "scheduled", next_due_date: "2026-08-09", is_overdue: false, task_description: "Lubrication & spindle check" },
  { id: 2, machine_id: "PR-03", machine_name: "Hydraulic Press", department: "Production", maintenance_type: "Inspection", scheduled_date: "2026-07-08", assigned_engineer: "Ravi Kumar", estimated_duration: "3h", status: "completed", next_due_date: "2026-08-08", is_overdue: false, task_description: "Pressure gauge calibration" },
  { id: 3, machine_id: "LT-02", machine_name: "CNC Lathe", department: "Production", maintenance_type: "Preventive", scheduled_date: "2026-07-05", assigned_engineer: "Suresh Reddy", estimated_duration: "1.5h", status: "scheduled", next_due_date: "2026-08-05", is_overdue: true, task_description: "Belt tension & coolant check" },
  { id: 4, machine_id: "ML-04", machine_name: "Vertical Mill", department: "Maintenance", maintenance_type: "Calibration", scheduled_date: "2026-07-12", assigned_engineer: "Mahesh Patel", estimated_duration: "4h", status: "scheduled", next_due_date: "2026-10-12", is_overdue: false, task_description: "Axis calibration" },
];

export const DEMO_BREAKDOWN_SUMMARY = {
  active_breakdowns: 4, total_downtime_hours: 48.5, avg_repair_time_mttr: 2.4,
  machine_availability_pct: 88.0, pending_repairs: 3, emergency_breakdowns: 1,
};

export const DEMO_BREAKDOWN_LIST = [
  { id: 1, breakdown_number: "BD-00042", machine_name: "Hydraulic Press", department: "Production", reported_by: "Ravi Kumar", reported_time: "2026-07-09T06:30:00", cause: "Hydraulic pump failure", severity: "critical", priority: "critical", engineer: "Mahesh Patel", estimated_completion: "2026-07-09T14:00:00", status: "in_progress", downtime_minutes: 270 },
  { id: 2, breakdown_number: "BD-00041", machine_name: "CNC Lathe", department: "Production", reported_by: "Suresh Reddy", reported_time: "2026-07-08T14:15:00", cause: "Spindle bearing noise", severity: "high", priority: "high", engineer: "Ravi Kumar", estimated_completion: "2026-07-09T10:00:00", status: "assigned", downtime_minutes: 120 },
  { id: 3, breakdown_number: "BD-00040", machine_name: "Conveyor Belt", department: "Stores", reported_by: "Operator", reported_time: "2026-07-07T09:00:00", cause: "Motor overload", severity: "medium", priority: "medium", engineer: "Suresh Reddy", estimated_completion: null, status: "resolved", downtime_minutes: 90 },
];

export const DEMO_HISTORY_LIST = [
  { id: 1, machine_name: "CNC Milling Center", activity: "Machine Installed", event_date: "2024-03-15", engineer: "Vendor Team", cost: null, spare_parts: null, downtime_minutes: null, remarks: "Commissioning completed" },
  { id: 2, machine_name: "CNC Milling Center", activity: "Preventive Maintenance", event_date: "2026-07-01", engineer: "Mahesh Patel", cost: 8500, spare_parts: "Lubricant, Filter", downtime_minutes: 120, remarks: "Monthly PM" },
  { id: 3, machine_name: "Hydraulic Press", activity: "Breakdown", event_date: "2026-07-09", engineer: "Mahesh Patel", cost: null, spare_parts: null, downtime_minutes: 270, remarks: "Hydraulic pump failure" },
  { id: 4, machine_name: "Hydraulic Press", activity: "Repair", event_date: "2026-07-09", engineer: "Mahesh Patel", cost: 24500, spare_parts: "Hydraulic Pump, Seal Kit", downtime_minutes: 180, remarks: "Pump replaced" },
  { id: 5, machine_name: "CNC Lathe", activity: "Calibration", event_date: "2026-06-20", engineer: "Ravi Kumar", cost: 5200, spare_parts: null, downtime_minutes: 60, remarks: "Axis calibration verified" },
];

export const DEMO_MAINTENANCE_HUB = {
  total_machines: 24, running: 18, under_maintenance: 2, breakdown: 1, idle: 3, machine_health_pct: 87.5,
  mttr_hours: 2.4, mtbf_hours: 168,
  labour_cost: 185000, spare_cost: 92000, external_cost: 45000, total_cost: 322000,
  calendar_events: [
    { day: 1, machine: "CNC-01", type: "Preventive" }, { day: 3, machine: "Press-03", type: "Inspection" },
    { day: 5, machine: "Lathe-02", type: "Calibration" }, { day: 8, machine: "CNC-01", type: "Preventive" },
    { day: 12, machine: "Mill-04", type: "Inspection" },
  ],
  machine_health: [
    { name: "CNC Milling Center", health: 95, code: "CNC-01" },
    { name: "Hydraulic Press", health: 72, code: "PR-03" },
    { name: "CNC Lathe", health: 88, code: "LT-02" },
    { name: "Vertical Mill", health: 91, code: "ML-04" },
  ],
  downtime_trend: [
    { month: "Jan", hours: 40 }, { month: "Feb", hours: 45 }, { month: "Mar", hours: 50 },
    { month: "Apr", hours: 55 }, { month: "May", hours: 60 }, { month: "Jun", hours: 65 },
  ],
  availability_trend: [
    { month: "Jan", pct: 88 }, { month: "Feb", pct: 89 }, { month: "Mar", pct: 90 },
    { month: "Apr", pct: 91 }, { month: "May", pct: 92 }, { month: "Jun", pct: 93 },
  ],
  cost_trend: [
    { month: "Jan", cost: 280000 }, { month: "Feb", cost: 295000 }, { month: "Mar", cost: 310000 },
    { month: "Apr", cost: 325000 }, { month: "May", cost: 340000 }, { month: "Jun", cost: 355000 },
  ],
  breakdown_frequency: [
    { month: "Jan", count: 6 }, { month: "Feb", count: 5 }, { month: "Mar", count: 4 },
    { month: "Apr", count: 4 }, { month: "May", count: 3 }, { month: "Jun", count: 3 },
  ],
  mttr_trend: [
    { month: "Jan", hours: 3.2 }, { month: "Feb", hours: 3.0 }, { month: "Mar", hours: 2.8 },
    { month: "Apr", hours: 2.6 }, { month: "May", hours: 2.5 }, { month: "Jun", hours: 2.4 },
  ],
  mtbf_trend: [
    { month: "Jan", hours: 150 }, { month: "Feb", hours: 155 }, { month: "Mar", hours: 160 },
    { month: "Apr", hours: 162 }, { month: "May", hours: 165 }, { month: "Jun", hours: 168 },
  ],
  preventive_vs_breakdown: [{ name: "Preventive", count: 18 }, { name: "Breakdown", count: 12 }],
  spare_parts: [
    { part_number: "SP-8842", spare_name: "Bearing 6205", stock: 12, minimum_stock: 20, vendor: "SKF India", cost: 850 },
    { part_number: "SP-8838", spare_name: "Hydraulic Seal", stock: 5, minimum_stock: 10, vendor: "Bosch", cost: 1200 },
    { part_number: "SP-8830", spare_name: "Cutting Tool Insert", stock: 45, minimum_stock: 30, vendor: "Sandvik", cost: 320 },
  ],
  work_orders: [
    { work_order_number: "MWO-0042", machine: "CNC-01", priority: "high", assigned_to: "Mahesh Patel", status: "in_progress" },
    { work_order_number: "MWO-0041", machine: "Press-03", priority: "critical", assigned_to: "Ravi Kumar", status: "assigned" },
  ],
  alerts: [
    { type: "due", message: "Preventive maintenance due tomorrow — CNC-01" },
    { type: "breakdown", message: "Press-03 breakdown — 4.5h downtime" },
    { type: "spare", message: "Low stock: Bearing 6205 (12/20)" },
    { type: "completed", message: "Lathe-02 maintenance completed by Ravi Kumar" },
  ],
};

export function formatInr(v) {
  if (v == null) return "—";
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

export function mntStatusColor(s) {
  const m = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    reported: "bg-orange-100 text-orange-800",
    assigned: "bg-amber-100 text-amber-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-slate-200 text-slate-700",
    verified: "bg-teal-100 text-teal-800",
    running: "bg-green-100 text-green-800",
    idle: "bg-slate-100 text-slate-700",
    breakdown: "bg-red-100 text-red-800",
    maintenance: "bg-amber-100 text-amber-800",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

/** Critical=Dark Red, High=Red, Medium=Orange, Low=Green */
export function priorityColor(p) {
  const m = {
    critical: "bg-red-900 text-white",
    high: "bg-red-100 text-red-800",
    medium: "bg-orange-100 text-orange-800",
    low: "bg-green-100 text-green-800",
  };
  return m[p] || "bg-slate-100 text-slate-700";
}

export function healthColor(score) {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-amber-500";
  return "bg-red-500";
}

export function healthTextColor(score) {
  if (score >= 90) return "text-green-700";
  if (score >= 75) return "text-amber-700";
  return "text-red-700";
}
