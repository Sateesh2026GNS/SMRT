/** Batch tracking demo data. */

export const DEMO_BATCH_SUMMARY = {
  total_batches: 48,
  running: 12,
  completed: 28,
  hold: 3,
  rejected: 2,
  expired: 1,
};

export const DEMO_BATCHES = [
  { id: "demo-b1", batch_code: "BATCH-2026-001", product_name: "Chair", work_order_number: "WO-1001", production_date: "2026-07-09", quantity: 1000, good_qty: 960, scrap_qty: 40, status: "running" },
  { id: "demo-b2", batch_code: "BATCH-2026-002", product_name: "Table", work_order_number: "WO-1002", production_date: "2026-07-09", quantity: 700, good_qty: 672, scrap_qty: 28, status: "running" },
  { id: "demo-b3", batch_code: "BATCH-2026-003", product_name: "Steel Frame", work_order_number: "WO-1003", production_date: "2026-07-08", quantity: 500, good_qty: 490, scrap_qty: 10, status: "completed" },
  { id: "demo-b4", batch_code: "BATCH-2026-004", product_name: "Desk", work_order_number: "WO-1004", production_date: "2026-07-07", quantity: 400, good_qty: 0, scrap_qty: 0, status: "hold" },
  { id: "demo-b5", batch_code: "BATCH-2026-005", product_name: "Cabinet", work_order_number: "WO-1005", production_date: "2026-06-30", quantity: 300, good_qty: 0, scrap_qty: 300, status: "rejected" },
];

export const BATCH_TRACE_STEPS = [
  "Raw Material", "BOM", "Production", "QC", "Packing", "Dispatch", "Customer",
];

export const DEMO_BATCH_DETAIL = {
  id: "demo-b1",
  batch_code: "BATCH-2026-001",
  product_name: "Chair",
  customer_name: "Tata Motors",
  production_order_number: "PO-2026-1001",
  work_order_number: "WO-1001",
  machine_name: "CNC-01",
  operator_name: "Ravi Kumar",
  shift: "Morning",
  material_lot: "RM-LOT-2026-441",
  qc_status: "pending",
  dispatch_status: "pending",
  invoice_number: null,
  quantity: 1000,
  good_qty: 960,
  scrap_qty: 40,
  status: "running",
  traceability: [
    { step: "Raw Material", status: "completed", detail: "RM-LOT-2026-441", timestamp: "2026-07-09T08:00:00" },
    { step: "BOM", status: "completed", detail: "BOM-v2.1", timestamp: "2026-07-09T08:15:00" },
    { step: "Production", status: "running", detail: "CNC-01", timestamp: "2026-07-09T08:30:00" },
    { step: "QC", status: "pending", detail: "Inspection #QC-8821", timestamp: null },
    { step: "Packing", status: "pending", detail: null, timestamp: null },
    { step: "Dispatch", status: "pending", detail: null, timestamp: null },
    { step: "Customer", status: "pending", detail: "Tata Motors", timestamp: null },
  ],
};

export const BATCH_STATUS_COLORS = {
  running: "bg-green-100 text-green-800",
  in_process: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  hold: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-slate-200 text-slate-700",
};

export function batchStatusColor(status) {
  return BATCH_STATUS_COLORS[status] || "bg-slate-100 text-slate-700";
}
