/** Sales demo data and helpers. */

export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];
export const LEAD_SOURCES = ["website", "referral", "trade_show", "cold_call", "linkedin", "exhibition"];
export const LEAD_INDUSTRIES = ["Manufacturing", "Automotive", "Pharma", "FMCG", "Construction", "Electronics"];
export const LEAD_REGIONS = ["North", "South", "East", "West", "Central"];
export const SALES_FLOW = [
  "Lead", "Opportunity", "Quotation", "Customer Approval", "Sales Order",
  "Production Planning", "Manufacturing", "Finished Goods Inventory",
  "Packing", "Dispatch", "Invoice", "Customer Payment", "Finance Ledger",
];

export const DEMO_LEAD_SUMMARY = { total_leads: 156, new_leads: 42, qualified_leads: 38, won_customers: 24, lost_leads: 18, conversion_rate: 15.4 };
export const DEMO_LEAD_LIST = [
  { id: "ld1", lead_id: "LD-00156", customer_name: "Rajesh Mehta", company: "Mehta Industries", contact: "+91 98765 43210", source: "website", sales_executive: "Ramesh Kumar", priority: "high", next_followup: "2026-07-12", status: "qualified", opportunity_value: 450000, industry: "Manufacturing", region: "West" },
  { id: "ld2", lead_id: "LD-00155", customer_name: "Priya Nair", company: "Nair Pharma", contact: "priya@nairpharma.com", source: "referral", sales_executive: "Anita Desai", priority: "medium", next_followup: "2026-07-10", status: "new", opportunity_value: 280000, industry: "Pharma", region: "South" },
  { id: "ld3", lead_id: "LD-00154", customer_name: "Vikram Singh", company: "Singh Auto Parts", contact: "+91 91234 56789", source: "trade_show", sales_executive: "Ramesh Kumar", priority: "urgent", next_followup: "2026-07-09", status: "contacted", opportunity_value: 620000, industry: "Automotive", region: "North" },
  { id: "ld4", lead_id: "LD-00153", customer_name: "Deepa Rao", company: "Rao Electronics", contact: "deepa@raoelec.com", source: "linkedin", sales_executive: "Priya Sharma", priority: "low", next_followup: "2026-07-15", status: "converted", opportunity_value: 180000, industry: "Electronics", region: "South" },
];

export const DEMO_QUOTE_SUMMARY = { total_quotations: 85, draft: 12, sent: 28, accepted: 32, rejected: 8, expired: 5 };
export const DEMO_QUOTE_LIST = [
  { id: "qt1", quote_number: "QT-2026-0085", customer_name: "Mehta Industries", sales_person: "Ramesh Kumar", amount: 425000, valid_until: "2026-07-25", status: "sent" },
  { id: "qt2", quote_number: "QT-2026-0084", customer_name: "Nair Pharma", sales_person: "Anita Desai", amount: 280000, valid_until: "2026-07-20", status: "accepted" },
  { id: "qt3", quote_number: "QT-2026-0083", customer_name: "Singh Auto Parts", sales_person: "Ramesh Kumar", amount: 620000, valid_until: "2026-07-05", status: "expired" },
];

export const DEMO_SO_SUMMARY = { total_orders: 120, pending: 18, confirmed: 45, packed: 22, shipped: 18, delivered: 12, cancelled: 3, revenue: 8_500_000 };
export const DEMO_SO_LIST = [
  { id: "so1", order_number: "SO-2026-0120", customer_name: "Mehta Industries", order_date: "2026-07-09", delivery_date: "2026-07-20", amount: 425000, payment_terms: "Net 30", status: "confirmed", sales_person: "Ramesh Kumar", warehouse_name: "FG Warehouse", packed: false, shipped: false, invoiced: false },
  { id: "so2", order_number: "SO-2026-0119", customer_name: "Nair Pharma", order_date: "2026-07-08", delivery_date: "2026-07-18", amount: 280000, payment_terms: "Net 45", status: "packed", sales_person: "Anita Desai", warehouse_name: "Plant-1 FG", packed: true, shipped: false, invoiced: false },
  { id: "so3", order_number: "SO-2026-0118", customer_name: "Rao Electronics", order_date: "2026-07-05", delivery_date: "2026-07-12", amount: 180000, payment_terms: "Advance 50%", status: "shipped", sales_person: "Priya Sharma", warehouse_name: "Main Warehouse", packed: true, shipped: true, invoiced: true },
];

export const DEMO_DISPATCH_SUMMARY = { ready_to_dispatch: 8, packed: 12, in_transit: 6, delivered: 45, delayed: 3 };
export const DEMO_DISPATCH_LIST = [
  { id: "dsp1", dispatch_number: "DSP-2026-0045", so_number: "SO-2026-0119", customer_name: "Nair Pharma", courier: "BlueDart", vehicle_number: "KA-01-AB-1234", driver_name: "Suresh Reddy", dispatch_date: "2026-07-09", eta: "2026-07-12", status: "packed", lr_number: "LR-456789" },
  { id: "dsp2", dispatch_number: "DSP-2026-0044", so_number: "SO-2026-0118", customer_name: "Rao Electronics", courier: "DTDC", vehicle_number: "TN-09-CD-5678", driver_name: "Mahesh Patel", dispatch_date: "2026-07-07", eta: "2026-07-10", status: "in_transit", lr_number: "LR-456788" },
  { id: "dsp3", dispatch_number: "DSP-2026-0043", so_number: "SO-2026-0115", customer_name: "Singh Auto Parts", courier: "Delhivery", vehicle_number: "DL-01-EF-9012", driver_name: "Ravi Kumar", dispatch_date: "2026-07-03", eta: "2026-07-06", status: "delivered", lr_number: "LR-456787" },
];

export const DEMO_INVOICE_SUMMARY = { total_invoices: 95, draft: 8, paid: 62, pending: 18, overdue: 7, revenue: 6_200_000 };
export const DEMO_INVOICE_LIST = [
  { id: "inv1", invoice_number: "INV-2026-0095", customer_name: "Rao Electronics", sales_order_number: "SO-2026-0118", amount: 212400, gst_amount: 32400, due_date: "2026-07-25", status: "pending", amount_paid: 0 },
  { id: "inv2", invoice_number: "INV-2026-0094", customer_name: "Nair Pharma", sales_order_number: "SO-2026-0116", amount: 330400, gst_amount: 50400, due_date: "2026-07-20", status: "paid", amount_paid: 330400 },
  { id: "inv3", invoice_number: "INV-2026-0093", customer_name: "Mehta Industries", sales_order_number: "SO-2026-0114", amount: 501500, gst_amount: 76500, due_date: "2026-07-05", status: "overdue", amount_paid: 200000 },
];

export const DEMO_SALES_HUB = {
  monthly_revenue: 8_500_000,
  total_orders: 120,
  pending_orders: 18,
  dispatch_pending: 20,
  outstanding_payments: 1_250_000,
  new_customers: 18,
  top_customers: [{ name: "Mehta Industries", orders: 12 }, { name: "Nair Pharma", orders: 8 }, { name: "Singh Auto Parts", orders: 6 }],
  sales_executive_performance: [
    { name: "Ramesh Kumar", revenue: 2_400_000, orders: 28 },
    { name: "Anita Desai", revenue: 1_850_000, orders: 22 },
    { name: "Priya Sharma", revenue: 1_200_000, orders: 15 },
  ],
  alerts: [
    { type: "overdue_payment", message: "Overdue Payments — ₹4.2L from 7 customers" },
    { type: "pending_dispatch", message: "Pending Dispatch — 12 orders ready to ship" },
    { type: "low_stock", message: "Low Stock — 5 FG items below reorder" },
    { type: "expiring_quote", message: "Expiring Quotations — 3 quotes expire this week" },
  ],
};

export function formatInr(v) {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)} Cr`;
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

export function statusColor(s) {
  const m = {
    new: "bg-blue-100 text-blue-800", contacted: "bg-indigo-100 text-indigo-800",
    qualified: "bg-purple-100 text-purple-800", converted: "bg-green-100 text-green-800", lost: "bg-red-100 text-red-800",
    draft: "bg-slate-100 text-slate-700", sent: "bg-blue-100 text-blue-800", accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800", expired: "bg-orange-100 text-orange-800",
    pending: "bg-amber-100 text-amber-800", confirmed: "bg-blue-100 text-blue-800", packed: "bg-indigo-100 text-indigo-800",
    shipped: "bg-teal-100 text-teal-800", delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
    in_transit: "bg-cyan-100 text-cyan-800", paid: "bg-green-100 text-green-800", overdue: "bg-red-100 text-red-800",
    partial: "bg-orange-100 text-orange-800",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

export function priorityColor(p) {
  const m = { urgent: "bg-red-100 text-red-800", high: "bg-orange-100 text-orange-800", medium: "bg-blue-100 text-blue-800", low: "bg-slate-100 text-slate-700" };
  return m[p] || m.medium;
}

export const KANBAN_COLUMNS = [
  { id: "new", label: "New", color: "border-blue-200 bg-blue-50" },
  { id: "contacted", label: "Contacted", color: "border-indigo-200 bg-indigo-50" },
  { id: "qualified", label: "Qualified", color: "border-purple-200 bg-purple-50" },
  { id: "converted", label: "Won", color: "border-green-200 bg-green-50" },
  { id: "lost", label: "Lost", color: "border-red-200 bg-red-50" },
];
