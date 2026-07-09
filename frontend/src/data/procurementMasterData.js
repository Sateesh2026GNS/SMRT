/** Procurement demo data and helpers. */

export const MR_PRIORITIES = ["low", "medium", "high", "urgent"];
export const MR_DEPARTMENTS = ["Production", "Maintenance", "Quality", "Stores", "Engineering"];
export const PROCUREMENT_FLOW = [
  "Production", "Material Requirement", "Material Request", "Manager Approval",
  "RFQ", "Vendor Quotations", "Quotation Comparison", "Purchase Order",
  "Vendor Delivery", "GRN", "Quality Inspection", "Raw Material Inventory",
  "Vendor Invoice", "Payment", "Ledger",
];

export const DEMO_MR_SUMMARY = { total_requests: 48, pending_approval: 12, approved: 28, rejected: 3, converted_to_rfq: 8, urgent_requests: 5 };
export const DEMO_MR_LIST = [
  { id: "mr1", mr_number: "MR-2026-0048", request_date: "2026-07-09", department: "Production", requested_by: "Ravi Kumar", priority: "high", item_count: 5, status: "pending", approval_status: "pending", required_date: "2026-07-15" },
  { id: "mr2", mr_number: "MR-2026-0047", request_date: "2026-07-08", department: "Maintenance", requested_by: "Mahesh Patel", priority: "medium", item_count: 3, status: "approved", approval_status: "approved", required_date: "2026-07-12" },
  { id: "mr3", mr_number: "MR-2026-0046", request_date: "2026-07-07", department: "Quality", requested_by: "Priya Sharma", priority: "low", item_count: 2, status: "rejected", approval_status: "rejected", required_date: "2026-07-10" },
  { id: "mr4", mr_number: "MR-2026-0045", request_date: "2026-07-06", department: "Stores", requested_by: "Suresh Reddy", priority: "urgent", item_count: 8, status: "approved", approval_status: "approved", required_date: "2026-07-09" },
];

export const DEMO_RFQ_SUMMARY = { open_rfqs: 6, vendor_responses: 18, expired_rfqs: 2, awarded_rfqs: 4 };
export const DEMO_RFQ_LIST = [
  { id: "rfq1", rfq_number: "RFQ-2026-0012", material_request_number: "MR-2026-0047", vendor_count: 3, due_date: "2026-07-15", quotation_count: 3, status: "open" },
  { id: "rfq2", rfq_number: "RFQ-2026-0011", material_request_number: "MR-2026-0045", vendor_count: 4, due_date: "2026-07-10", quotation_count: 4, status: "awarded" },
  { id: "rfq3", rfq_number: "RFQ-2026-0010", material_request_number: "MR-2026-0044", vendor_count: 2, due_date: "2026-07-05", quotation_count: 2, status: "expired" },
];
export const DEMO_VENDOR_COMPARISON = [
  { supplier_id: 1, supplier_name: "Tata Steel", price: 85000, delivery_days: 7, gst_pct: 18, warranty: "12 months", rating: 4.5, score: 92, is_best: true },
  { supplier_id: 2, supplier_name: "JSW Steel", price: 88000, delivery_days: 5, gst_pct: 18, warranty: "6 months", rating: 4.2, score: 85 },
  { supplier_id: 3, supplier_name: "SAIL", price: 82000, delivery_days: 10, gst_pct: 18, warranty: "12 months", rating: 4.0, score: 78 },
];

export const DEMO_PO_SUMMARY = { total_po: 85, pending: 12, approved: 45, delivered: 22, cancelled: 3, po_value: 4_500_000 };
export const DEMO_PO_LIST = [
  { id: "po1", po_number: "PO-2026-0045", vendor_name: "Tata Steel", order_date: "2026-07-09", total_amount: 125000, expected_date: "2026-07-20", payment_terms: "Net 30", status: "approved", buyer: "Ramesh Kumar" },
  { id: "po2", po_number: "PO-2026-0044", vendor_name: "Bosch India", order_date: "2026-07-08", total_amount: 85000, expected_date: "2026-07-18", payment_terms: "Net 45", status: "pending", buyer: "Anita Desai" },
  { id: "po3", po_number: "PO-2026-0043", vendor_name: "SKF India", order_date: "2026-07-05", total_amount: 42000, expected_date: "2026-07-12", payment_terms: "Net 15", status: "delivered", buyer: "Mahesh Patel" },
];

export const DEMO_GRN_SUMMARY = { todays_grn: 4, pending_qc: 6, received: 32, rejected: 2, total_value: 1_250_000 };
export const DEMO_GRN_LIST = [
  { id: "grn1", grn_number: "GRN-2026-0032", po_number: "PO-2026-0043", vendor_name: "SKF India", warehouse_name: "Raw Material Store", quantity: 500, qc_status: "passed", received_by: "Ravi Kumar", status: "received", receipt_date: "2026-07-09" },
  { id: "grn2", grn_number: "GRN-2026-0031", po_number: "PO-2026-0042", vendor_name: "Tata Steel", warehouse_name: "Main Warehouse", quantity: 1200, qc_status: "pending", received_by: "Suresh Reddy", status: "received", receipt_date: "2026-07-08" },
  { id: "grn3", grn_number: "GRN-2026-0030", po_number: "PO-2026-0040", vendor_name: "Castrol", warehouse_name: "Plant-1 Store", quantity: 200, qc_status: "rejected", received_by: "Mahesh Patel", status: "rejected", receipt_date: "2026-07-07" },
];

export const DEMO_BILL_SUMMARY = { total_bills: 42, due_bills: 8, paid: 28, outstanding: 850_000 };
export const DEMO_BILL_LIST = [
  { id: "vb1", bill_number: "VB-2026-0018", vendor_name: "Tata Steel", po_number: "PO-2026-0040", grn_number: "GRN-2026-0028", amount: 118000, gst_amount: 21240, due_date: "2026-07-25", status: "pending" },
  { id: "vb2", bill_number: "VB-2026-0017", vendor_name: "SKF India", po_number: "PO-2026-0043", grn_number: "GRN-2026-0032", amount: 42000, gst_amount: 7560, due_date: "2026-07-20", status: "due" },
  { id: "vb3", bill_number: "VB-2026-0016", vendor_name: "Bosch India", po_number: "PO-2026-0038", grn_number: "GRN-2026-0025", amount: 95000, gst_amount: 17100, due_date: "2026-07-10", status: "paid" },
];

export const DEMO_PROCUREMENT_HUB = {
  purchase_spend: 4_500_000,
  pending_approvals: 18,
  open_rfqs: 6,
  active_vendors: 25,
  outstanding_bills: 850_000,
  todays_deliveries: 4,
  top_vendors: [{ name: "Tata Steel", rating: 4.8 }, { name: "Bosch India", rating: 4.5 }, { name: "SKF India", rating: 4.3 }],
  pending_orders: [{ po_number: "PO-2026-0045", vendor: "Tata Steel", amount: 125000 }],
  alerts: [
    { type: "low_stock", message: "Low Stock — 12 items below reorder" },
    { type: "delayed_po", message: "Delayed PO — PO-2026-0045 overdue" },
    { type: "pending_rfq", message: "Pending RFQ — 3 awaiting response" },
    { type: "overdue_bill", message: "Overdue Bill — ₹2.4L outstanding" },
  ],
};

export function formatInr(v) {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)} Cr`;
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

export function priorityColor(p) {
  const m = { urgent: "bg-red-100 text-red-800", high: "bg-orange-100 text-orange-800", medium: "bg-blue-100 text-blue-800", low: "bg-slate-100 text-slate-700" };
  return m[p] || m.medium;
}

export function statusColor(s) {
  const m = { pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800", open: "bg-blue-100 text-blue-800", awarded: "bg-emerald-100 text-emerald-800", expired: "bg-slate-200 text-slate-700", draft: "bg-slate-100 text-slate-700", delivered: "bg-teal-100 text-teal-800", paid: "bg-green-100 text-green-800", due: "bg-orange-100 text-orange-800" };
  return m[s] || "bg-slate-100 text-slate-700";
}
