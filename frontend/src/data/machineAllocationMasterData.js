/** Machine allocation demo data. */

import { PRIORITY_COLORS } from "./productionPlanningMasterData";

export const DEMO_ALLOC_SUMMARY = {
  total_machines: 0,
  allocated: 0,
  free_machines: 0,
  under_maintenance: 0,
  utilization_pct: 0,
};

export const DEMO_ALLOCATIONS = [];

export const DEMO_UNASSIGNED = [];

export const DEMO_MACHINE_AVAIL = [];

export const ALLOC_FLOW_STEPS = [
  "Work Order", "Machine Assign", "Operator Assign", "Shift Assign", "Supervisor Assign", "Start Production",
];

export function priorityStyle(priority) {
  const p = (priority || "medium").toLowerCase();
  return PRIORITY_COLORS[p] || PRIORITY_COLORS.medium;
}
