/** Quality demo data and helpers. */

export const QUALITY_FLOW = [
  "Purchase Order", "Incoming Inspection", "Inventory", "Production",
  "In Process QC", "Final QC", "Packing", "Dispatch", "Customer",
];

export const FINAL_QC_FLOW = [
  "Production", "In Process QC", "Final QC", "Packing", "Dispatch",
];

export const DEFECT_WORKFLOW = [
  "New", "Assigned", "In Progress", "Verification", "Resolved", "Closed",
];

export const CAPA_STATUSES = ["open", "assigned", "in_progress", "verification", "resolved", "closed"];

export const DEMO_INCOMING_SUMMARY = {
  todays_inspections: 12, pending_inspection: 5, passed: 28, failed: 3, rejected_lots: 2, avg_inspection_time: 18.5,
};

export const DEMO_INCOMING_LIST = [
  { id: 1, inspection_number: "IQC-2026-0042", po_reference: "PO-2026-0045", vendor_name: "Tata Steel", material_name: "MS Sheet 2mm", batch_code: "B-8842", quantity: 500, inspector: "Priya Sharma", result: "pass", status: "passed", inspection_date: "2026-07-09", inspection_time_minutes: 15, attachment: "iqc_photo.jpg" },
  { id: 2, inspection_number: "IQC-2026-0041", po_reference: "PO-2026-0043", vendor_name: "SKF India", material_name: "Bearing 6205", batch_code: "B-8838", quantity: 200, inspector: "Ravi Kumar", result: "pending", status: "pending", inspection_date: "2026-07-09", inspection_time_minutes: null, attachment: null },
  { id: 3, inspection_number: "IQC-2026-0040", po_reference: "PO-2026-0040", vendor_name: "Bosch India", material_name: "Hydraulic Valve", batch_code: "B-8830", quantity: 50, inspector: "Mahesh Patel", result: "fail", status: "failed", inspection_date: "2026-07-08", inspection_time_minutes: 22, attachment: "reject_report.pdf" },
  { id: 4, inspection_number: "IQC-2026-0039", po_reference: "PO-2026-0038", vendor_name: "Castrol", material_name: "Cutting Oil", batch_code: "B-8825", quantity: 100, inspector: "Priya Sharma", result: "pass", status: "passed", inspection_date: "2026-07-08", inspection_time_minutes: 12, attachment: null },
];

export const DEMO_PROCESS_SUMMARY = {
  production_running: 8, qc_pending: 6, passed: 42, failed: 4, rework: 3, scrap: 2,
};

export const DEMO_PROCESS_LIST = [
  { id: 1, work_order_number: "WO-2026-0088", machine_name: "CNC-01", shift: "Morning", operator_name: "Ravi Kumar", inspection_time: "2026-07-09 08:30", qc_status: "passed", remarks: "Within tolerance", product_name: "Component A", batch_code: "B-9901" },
  { id: 2, work_order_number: "WO-2026-0087", machine_name: "Press-03", shift: "Morning", operator_name: "Suresh Reddy", inspection_time: "2026-07-09 09:15", qc_status: "pending", remarks: "Awaiting dimensional check", product_name: "Bracket B", batch_code: "B-9900" },
  { id: 3, work_order_number: "WO-2026-0086", machine_name: "Lathe-02", shift: "General", operator_name: "Mahesh Patel", inspection_time: "2026-07-09 10:00", qc_status: "rework", remarks: "Surface finish out of spec", product_name: "Shaft C", batch_code: "B-9899" },
  { id: 4, work_order_number: "WO-2026-0085", machine_name: "CNC-01", shift: "Evening", operator_name: "Ravi Kumar", inspection_time: "2026-07-08 14:45", qc_status: "failed", remarks: "Dimensional deviation +0.05mm", product_name: "Component A", batch_code: "B-9898" },
];

export const DEMO_FINAL_SUMMARY = {
  pending_final: 4, passed: 18, failed: 2, packed: 14, ready_dispatch: 10,
};

export const DEMO_FINAL_LIST = [
  { id: 1, inspection_number: "FQC-2026-0018", customer_name: "ABC Industries", sales_order_number: "SO-2026-0088", product_name: "Finished Goods A", batch_code: "B-9901", packing_status: "packed", approval: "approved", certificate_ref: "COA-2026-018", result: "pass", status: "passed", inspector: "Priya Sharma", inspection_date: "2026-07-09" },
  { id: 2, inspection_number: "FQC-2026-0017", customer_name: "XYZ Corp", sales_order_number: "SO-2026-0085", product_name: "Assembly Kit B", batch_code: "B-9895", packing_status: "in_progress", approval: "pending", certificate_ref: null, result: "pending", status: "pending", inspector: "Ravi Kumar", inspection_date: "2026-07-09" },
  { id: 3, inspection_number: "FQC-2026-0016", customer_name: "PQR Ltd", sales_order_number: "SO-2026-0080", product_name: "Spare Parts C", batch_code: "B-9890", packing_status: "packed", approval: "approved", certificate_ref: "COC-2026-016", result: "pass", status: "passed", inspector: "Mahesh Patel", inspection_date: "2026-07-08" },
];

export const DEMO_BATCH_SUMMARY = {
  total_batches: 86, passed: 78, failed: 8, yield_pct: 94.2, scrap_pct: 2.8, rework_pct: 3.0,
};

export const DEMO_BATCH_LIST = [
  { id: 1, batch_code: "B-9901", product_name: "Component A", shift: "Morning", production_qty: 500, pass_qty: 485, reject_qty: 15, yield_pct: 97.0, inspector: "Priya Sharma", report_date: "2026-07-09" },
  { id: 2, batch_code: "B-9900", product_name: "Bracket B", shift: "Morning", production_qty: 300, pass_qty: 276, reject_qty: 24, yield_pct: 92.0, inspector: "Ravi Kumar", report_date: "2026-07-09" },
  { id: 3, batch_code: "B-9899", product_name: "Shaft C", shift: "General", production_qty: 200, pass_qty: 188, reject_qty: 12, yield_pct: 94.0, inspector: "Mahesh Patel", report_date: "2026-07-08" },
  { id: 4, batch_code: "B-9898", product_name: "Component A", shift: "Evening", production_qty: 450, pass_qty: 405, reject_qty: 45, yield_pct: 90.0, inspector: "Priya Sharma", report_date: "2026-07-08" },
];

export const DEMO_DEFECT_SUMMARY = {
  total_defects: 24, open: 8, in_progress: 6, resolved: 10, critical: 2, capa_pending: 5,
};

export const DEMO_DEFECT_LIST = [
  { id: 1, defect_code: "DEF-2026-0024", description: "Dimensional out of tolerance", product_name: "Component A", batch_code: "B-9898", machine_name: "CNC-01", department: "Production", root_cause: "Tool wear", corrective_action: "Replace cutting tool", preventive_action: "Add tool life monitoring", assigned_to: "Mahesh Patel", due_date: "2026-07-12", attachment: "defect_photo.jpg", severity: "high", status: "in_progress", quantity_affected: 12, reported_at: "2026-07-09T08:00:00" },
  { id: 2, defect_code: "DEF-2026-0023", description: "Surface scratch on finish", product_name: "Bracket B", batch_code: "B-9900", machine_name: "Press-03", department: "Quality", root_cause: "Handling damage", corrective_action: "Repack with foam padding", preventive_action: "Update SOP for handling", assigned_to: "Priya Sharma", due_date: "2026-07-10", attachment: null, severity: "medium", status: "assigned", quantity_affected: 5, reported_at: "2026-07-08T14:30:00" },
  { id: 3, defect_code: "DEF-2026-0022", description: "Material hardness below spec", product_name: "Shaft C", batch_code: "B-9899", machine_name: "Lathe-02", department: "Production", root_cause: "Incorrect heat treatment", corrective_action: "Re-heat treat batch", preventive_action: "Verify HT certificate", assigned_to: "Ravi Kumar", due_date: "2026-07-11", attachment: "ht_report.pdf", severity: "critical", status: "verification", quantity_affected: 20, reported_at: "2026-07-08T10:00:00" },
];

export const DEMO_QUALITY_HUB = {
  total_inspections: 174, passed: 156, failed: 12, rejected: 6, yield_pct: 94.2, defect_rate: 4.2,
  pass_vs_fail: [{ name: "Pass", count: 156 }, { name: "Fail", count: 12 }, { name: "Pending", count: 6 }],
  defect_trend: [
    { month: "Jan", count: 8 }, { month: "Feb", count: 10 }, { month: "Mar", count: 12 },
    { month: "Apr", count: 14 }, { month: "May", count: 16 }, { month: "Jun", count: 18 },
  ],
  monthly_yield: [
    { month: "Jan", yield: 92 }, { month: "Feb", yield: 93 }, { month: "Mar", yield: 93.5 },
    { month: "Apr", yield: 94 }, { month: "May", yield: 94.5 }, { month: "Jun", yield: 95 },
  ],
  supplier_quality: [{ name: "Tata Steel", score: 92 }, { name: "SKF India", score: 88 }, { name: "Bosch India", score: 95 }],
  machine_defects: [{ name: "CNC-01", defects: 5 }, { name: "Press-03", defects: 8 }, { name: "Lathe-02", defects: 3 }],
  pareto_defects: [{ name: "Dimensional", count: 12 }, { name: "Surface Finish", count: 8 }, { name: "Material Defect", count: 6 }, { name: "Assembly", count: 4 }],
  root_cause_analysis: [{ cause: "Operator Error", count: 10 }, { cause: "Machine Calibration", count: 7 }, { cause: "Raw Material", count: 5 }],
  defect_by_product: [{ name: "Component A", count: 9 }, { name: "Finished B", count: 6 }, { name: "Spare C", count: 4 }],
  qc_performance: [{ inspector: "Priya Sharma", inspections: 45, pass_rate: 96 }, { inspector: "Ravi Kumar", inspections: 38, pass_rate: 94 }],
  recent_inspections: [
    { number: "IQC-2026-0042", type: "incoming", result: "pass", date: "2026-07-09" },
    { number: "PQC-2026-0088", type: "in_process", result: "pass", date: "2026-07-09" },
    { number: "FQC-2026-0018", type: "final", result: "pending", date: "2026-07-09" },
  ],
  alerts: [
    { type: "pending", message: "5 incoming inspections pending QC approval" },
    { type: "defect", message: "2 critical defects require CAPA closure" },
    { type: "yield", message: "Batch BATCH-8842 yield dropped to 88%" },
    { type: "calibration", message: "Vernier caliper calibration due in 3 days" },
  ],
};

/** Pass=Green, Fail=Red, Pending=Orange */
export function qcStatusColor(s) {
  const m = {
    pass: "bg-green-100 text-green-800",
    passed: "bg-green-100 text-green-800",
    fail: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
    pending: "bg-orange-100 text-orange-800",
    rework: "bg-amber-100 text-amber-800",
    scrap: "bg-red-200 text-red-900",
    rejected: "bg-red-100 text-red-800",
    approved: "bg-green-100 text-green-800",
    packed: "bg-blue-100 text-blue-800",
    in_progress: "bg-blue-100 text-blue-800",
    open: "bg-orange-100 text-orange-800",
    new: "bg-orange-100 text-orange-800",
    assigned: "bg-indigo-100 text-indigo-800",
    verification: "bg-purple-100 text-purple-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-slate-200 text-slate-700",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

/** Low=Green, Medium=Orange, High=Red, Critical=Dark Red */
export function severityColor(s) {
  const m = {
    low: "bg-green-100 text-green-800",
    medium: "bg-orange-100 text-orange-800",
    high: "bg-red-100 text-red-800",
    critical: "bg-red-900 text-white",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

export function formatPct(v) {
  if (v == null) return "—";
  return `${Number(v).toFixed(1)}%`;
}
