/** Machine allocation demo data. */

import { PRIORITY_COLORS } from "./productionPlanningMasterData";

export const DEMO_ALLOC_SUMMARY = {
  total_machines: 25,
  allocated: 18,
  free_machines: 5,
  under_maintenance: 2,
  utilization_pct: 72,
};

export const DEMO_ALLOCATIONS = [
  { work_order_id: "al-1", work_order_number: "WO-1001", product_name: "Chair", machine_id: "al-m1", machine_name: "Machine-01", operator_name: "Ravi Kumar", shift: "Morning", supervisor: "Ramesh Kumar", capacity_pct: 65, status: "running", priority: "high" },
  { work_order_id: "al-2", work_order_number: "WO-1002", product_name: "Table", machine_id: "al-m2", machine_name: "Machine-02", operator_name: "Mahesh Patel", shift: "Afternoon", supervisor: "Ramesh Kumar", capacity_pct: 30, status: "running", priority: "medium" },
  { work_order_id: "al-3", work_order_number: "WO-1003", product_name: "Steel Frame", machine_id: null, machine_name: null, operator_name: null, shift: null, supervisor: null, capacity_pct: 0, status: "unassigned", priority: "low" },
  { work_order_id: "al-4", work_order_number: "WO-1004", product_name: "Desk", machine_id: "al-m4", machine_name: "Machine-04", operator_name: "Priya Sharma", shift: "Morning", supervisor: "Anita Desai", capacity_pct: 0, status: "planned", priority: "medium" },
];

export const DEMO_UNASSIGNED = [
  { work_order_id: "al-3", work_order_number: "WO-1003", product_name: "Steel Frame", priority: "low" },
  { work_order_id: "al-5", work_order_number: "WO-1005", product_name: "Shelf", priority: "medium" },
];

export const DEMO_MACHINE_AVAIL = [
  { machine_id: "al-m1", machine_name: "Machine-01", status: "running", free_time: null, current_job: "WO-1001", utilization_pct: 90 },
  { machine_id: "al-m2", machine_name: "Machine-02", status: "running", free_time: null, current_job: "WO-1002", utilization_pct: 60 },
  { machine_id: "al-m3", machine_name: "Machine-03", status: "idle", free_time: "14:00", current_job: null, utilization_pct: 20 },
  { machine_id: "al-m4", machine_name: "Machine-04", status: "planned", free_time: "12:00", current_job: "WO-1004", utilization_pct: 45 },
  { machine_id: "al-m5", machine_name: "Machine-05", status: "maintenance", free_time: "18:00", current_job: null, utilization_pct: 0 },
];

export const ALLOC_FLOW_STEPS = [
  "Work Order", "Machine Assign", "Operator Assign", "Shift Assign", "Supervisor Assign", "Start Production",
];

export function priorityStyle(priority) {
  const p = (priority || "medium").toLowerCase();
  return PRIORITY_COLORS[p] || PRIORITY_COLORS.medium;
}
