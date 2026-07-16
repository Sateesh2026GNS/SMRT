/** Finance demo data and helpers. */

export const FINANCE_FLOW = [
  "Purchase Order", "Goods Receipt", "Vendor Bill", "Accounts Payable",
  "Payment", "General Ledger", "GST Update", "Profit & Loss", "Balance Sheet",
];

export const FINANCIAL_YEARS = ["2025-26", "2024-25", "2023-24"];
export const BRANCHES = ["Head Office", "Plant-1", "Plant-2", "Warehouse"];
export const COST_CENTERS = ["Production", "HR", "Sales", "Procurement", "Warehouse", "Administration"];
export const GST_REPORTS = ["GSTR-1", "GSTR-2B", "GSTR-3B", "GSTR-9", "HSN Summary", "SAC Summary"];

export const DEMO_AP_SUMMARY = {
  outstanding_payables: 8_50_000,
  due_this_week: 5,
  overdue_bills: 3,
  paid_this_month: 4_20_000,
  pending_approvals: 6,
  vendor_count: 25,
};

export const DEMO_AP_LIST = [
  { id: 1, bill_number: "VB-2026-0018", vendor_name: "Tata Steel", po_reference: "PO-2026-0040", invoice_no: "TS-INV-8842", invoice_date: "2026-07-05", due_date: "2026-07-25", amount: 118000, gst: 21240, paid: 0, balance: 118000, status: "pending" },
  { id: 2, bill_number: "VB-2026-0017", vendor_name: "SKF India", po_reference: "PO-2026-0043", invoice_no: "SKF-4421", invoice_date: "2026-07-03", due_date: "2026-07-20", amount: 42000, gst: 7560, paid: 0, balance: 42000, status: "due" },
  { id: 3, bill_number: "VB-2026-0016", vendor_name: "Bosch India", po_reference: "PO-2026-0038", invoice_no: "BOS-9912", invoice_date: "2026-06-28", due_date: "2026-07-10", amount: 95000, gst: 17100, paid: 95000, balance: 0, status: "paid" },
  { id: 4, bill_number: "VB-2026-0015", vendor_name: "Castrol", po_reference: "PO-2026-0035", invoice_no: "CAS-3301", invoice_date: "2026-06-20", due_date: "2026-07-05", amount: 68000, gst: 12240, paid: 0, balance: 68000, status: "overdue" },
];

export const DEMO_AR_SUMMARY = {
  total_receivables: 12_50_000,
  received_today: 85_000,
  overdue: 4_20_000,
  pending_collection: 6_80_000,
  credit_customers: 18,
  aging_0_30: 5_80_000,
  aging_31_60: 3_20_000,
  aging_61_90: 2_10_000,
  aging_90_plus: 1_40_000,
};

export const DEMO_AR_LIST = [
  { id: 1, invoice_number: "INV-2026-0088", customer_name: "ABC Industries", issue_date: "2026-07-01", due_date: "2026-07-31", amount: 245000, paid: 100000, balance: 145000, days_overdue: 0, aging_bucket: "0-30", status: "partial" },
  { id: 2, invoice_number: "INV-2026-0085", customer_name: "XYZ Corp", issue_date: "2026-06-10", due_date: "2026-07-10", amount: 180000, paid: 0, balance: 180000, days_overdue: 0, aging_bucket: "31-60", status: "overdue" },
  { id: 3, invoice_number: "INV-2026-0080", customer_name: "PQR Ltd", issue_date: "2026-05-15", due_date: "2026-06-15", amount: 320000, paid: 50000, balance: 270000, days_overdue: 24, aging_bucket: "61-90", status: "overdue" },
  { id: 4, invoice_number: "INV-2026-0072", customer_name: "LMN Traders", issue_date: "2026-04-01", due_date: "2026-05-01", amount: 95000, paid: 0, balance: 95000, days_overdue: 69, aging_bucket: "90+", status: "overdue" },
];

export const DEMO_PAY_SUMMARY = {
  cash_received_today: 1_25_000,
  online_payments: 8_50_000,
  cash_payments: 2_40_000,
  bank_transfers: 15_60_000,
  failed_payments: 2,
  pending_payments: 5,
};

export const DEMO_PAY_LIST = [
  { id: 1, payment_number: "PAY-00042", invoice: "INV-2026-0088", party_name: "ABC Industries", party_type: "customer", payment_date: "2026-07-09", amount: 85000, method: "neft", bank: "HDFC Current A/c", transaction_id: "TXN00000042", utr_number: "UTR000000000042", payment_mode: "NEFT", currency: "INR", status: "completed", attachment: "receipt.pdf", created_by: "Ramesh Kumar" },
  { id: 2, payment_number: "PAY-00041", invoice: "INV-2026-0085", party_name: "XYZ Corp", party_type: "customer", payment_date: "2026-07-08", amount: 50000, method: "upi", bank: "HDFC Current A/c", transaction_id: "TXN00000041", utr_number: "UTR000000000041", payment_mode: "UPI", currency: "INR", status: "completed", attachment: null, created_by: "Anita Desai" },
  { id: 3, payment_number: "VPY-00018", invoice: "VB-2026-0016", party_name: "Bosch India", party_type: "vendor", payment_date: "2026-07-07", amount: 95000, method: "rtgs", bank: "ICICI Vendor A/c", transaction_id: "VTX00000018", utr_number: "UTR000000000018", payment_mode: "RTGS", currency: "INR", status: "completed", attachment: "payment_voucher.pdf", created_by: "Accounts Payable" },
  { id: 4, payment_number: "PAY-00040", invoice: "INV-2026-0080", party_name: "PQR Ltd", party_type: "customer", payment_date: "2026-07-06", amount: 50000, method: "cheque", bank: "HDFC Current A/c", transaction_id: "TXN00000040", utr_number: null, payment_mode: "CHEQUE", currency: "INR", status: "pending", attachment: null, created_by: "Mahesh Patel" },
];

export const DEMO_GL_SUMMARY = {
  total_assets: 85_00_000,
  total_liabilities: 28_00_000,
  equity: 57_00_000,
  revenue: 45_00_000,
  expenses: 32_00_000,
  cash_balance: 12_50_000,
};

export const DEMO_GL_LIST = [
  { id: 1, voucher_no: "JV-2026-0042", entry_date: "2026-07-09", account: "Accounts Receivable", debit: 245000, credit: 0, balance: 245000, narration: "Sales invoice INV-2026-0088", cost_center: "Sales", branch: "Head Office" },
  { id: 2, voucher_no: "JV-2026-0042", entry_date: "2026-07-09", account: "Sales Revenue", debit: 0, credit: 200900, balance: 200900, narration: "Sales invoice INV-2026-0088", cost_center: "Sales", branch: "Head Office" },
  { id: 3, voucher_no: "PV-2026-0018", entry_date: "2026-07-07", account: "Accounts Payable", debit: 0, credit: 95000, balance: 95000, narration: "Vendor payment Bosch India", cost_center: "Procurement", branch: "Plant-1" },
  { id: 4, voucher_no: "PV-2026-0018", entry_date: "2026-07-07", account: "Bank Account", debit: 95000, credit: 0, balance: 95000, narration: "Vendor payment Bosch India", cost_center: "Procurement", branch: "Plant-1" },
];

export const DEMO_GST = {
  year: 2026,
  sgst: 4_50_000,
  cgst: 4_50_000,
  igst: 2_80_000,
  total_gst: 11_80_000,
  taxable_value: 65_00_000,
  gst_payable: 7_08_000,
  gst_receivable: 4_72_000,
  monthly_collection: [
    { month: "Apr", amount: 920000 }, { month: "May", amount: 980000 }, { month: "Jun", amount: 1050000 },
    { month: "Jul", amount: 1100000 }, { month: "Aug", amount: 1080000 }, { month: "Sep", amount: 1120000 },
  ],
  gst_trend: [
    { month: "Apr", sgst: 375000, cgst: 375000, igst: 233000 },
    { month: "May", sgst: 400000, cgst: 400000, igst: 248000 },
    { month: "Jun", sgst: 425000, cgst: 425000, igst: 262000 },
  ],
  gst_by_customer: [
    { name: "ABC Industries", gst: 259600 },
    { name: "XYZ Corp", gst: 212400 },
    { name: "PQR Ltd", gst: 177000 },
  ],
  gst_by_product: [
    { name: "Finished Goods A", gst: 413000 },
    { name: "Component B", gst: 295000 },
    { name: "Spare Parts", gst: 141600 },
  ],
};

export const DEMO_PL = {
  year: 2026,
  revenue: 45_00_000,
  gross_profit: 36_00_000,
  net_profit: 13_00_000,
  ebitda: 15_56_000,
  operating_cost: 11_20_000,
  manufacturing_cost: 14_40_000,
  inventory_cost: 9_00_000,
  monthly_revenue: [
    { month: "Jan", amount: 3400000 }, { month: "Feb", amount: 3600000 }, { month: "Mar", amount: 3800000 },
    { month: "Apr", amount: 4000000 }, { month: "May", amount: 4200000 }, { month: "Jun", amount: 4100000 },
  ],
  expense_trend: [
    { month: "Jan", amount: 2500000 }, { month: "Feb", amount: 2600000 }, { month: "Mar", amount: 2700000 },
    { month: "Apr", amount: 2750000 }, { month: "May", amount: 2800000 }, { month: "Jun", amount: 2850000 },
  ],
  profit_trend: [
    { month: "Jan", amount: 900000 }, { month: "Feb", amount: 1000000 }, { month: "Mar", amount: 1100000 },
    { month: "Apr", amount: 1250000 }, { month: "May", amount: 1400000 }, { month: "Jun", amount: 1250000 },
  ],
  revenue_vs_expense: [
    { month: "Jan", revenue: 3400000, expense: 2500000 },
    { month: "Feb", revenue: 3600000, expense: 2600000 },
    { month: "Mar", revenue: 3800000, expense: 2700000 },
  ],
  department_cost: [
    { name: "Production", amount: 1440000 },
    { name: "HR", amount: 384000 },
    { name: "Sales", amount: 256000 },
    { name: "Procurement", amount: 320000 },
    { name: "Administration", amount: 160000 },
  ],
  factory_cost: [
    { name: "Raw Material", amount: 720000 },
    { name: "Labour", amount: 360000 },
    { name: "Machine", amount: 172800 },
    { name: "Electricity", amount: 115200 },
    { name: "Maintenance", amount: 72000 },
  ],
  total_revenue: 45_00_000,
  total_expenses: 32_00_000,
  profit: 13_00_000,
  revenue_rows: [],
  expense_rows: [],
};

export const DEMO_FINANCE_HUB = {
  total_receivables: 12_50_000,
  outstanding_payables: 8_50_000,
  cash_balance: 12_50_000,
  monthly_revenue: 37_50_000,
  monthly_expenses: 26_66_667,
  net_profit: 10_83_333,
  gst_payable: 7_08_000,
  cash_flow_trend: [
    { month: "Jan", inflow: 3800000, outflow: 2800000 },
    { month: "Feb", inflow: 4000000, outflow: 2950000 },
    { month: "Mar", inflow: 4200000, outflow: 3100000 },
    { month: "Apr", inflow: 4400000, outflow: 3250000 },
    { month: "May", inflow: 4600000, outflow: 3400000 },
    { month: "Jun", inflow: 4800000, outflow: 3550000 },
  ],
  revenue_trend: DEMO_PL.monthly_revenue,
  expense_trend: DEMO_PL.expense_trend,
  profit_trend: DEMO_PL.profit_trend,
  gst_trend: DEMO_GST.gst_trend,
  vendor_payments: [
    { month: "Jan", amount: 1800000 }, { month: "Feb", amount: 1900000 }, { month: "Mar", amount: 2000000 },
    { month: "Apr", amount: 2100000 }, { month: "May", amount: 2200000 }, { month: "Jun", amount: 2300000 },
  ],
  customer_receipts: [
    { month: "Jan", amount: 2200000 }, { month: "Feb", amount: 2350000 }, { month: "Mar", amount: 2500000 },
    { month: "Apr", amount: 2650000 }, { month: "May", amount: 2800000 }, { month: "Jun", amount: 2950000 },
  ],
  monthly_cost: DEMO_PL.expense_trend,
  department_cost: DEMO_PL.department_cost,
  manufacturing_cost: DEMO_PL.factory_cost,
  budget_vs_actual: [
    { name: "Production", budget: 1500000, actual: 1420000 },
    { name: "Sales", budget: 500000, actual: 480000 },
    { name: "HR", budget: 800000, actual: 850000 },
  ],
  accounts_aging: [
    { bucket: "0-30 Days", amount: 580000 },
    { bucket: "31-60 Days", amount: 320000 },
    { bucket: "61-90 Days", amount: 210000 },
    { bucket: "90+ Days", amount: 140000 },
  ],
  alerts: [
    { type: "overdue", message: "₹4.2L overdue from customers" },
    { type: "gst", message: "GSTR-3B filing due — ₹7.1L payable" },
    { type: "ap", message: "3 vendor bills overdue" },
    { type: "budget", message: "HR department over budget by 6.25%" },
  ],
};

export const GL_PLANNED_FEATURES = [
  "Chart of Accounts", "Journal Entries", "Trial Balance", "Cost Center Allocation",
  "Multi-branch Ledger", "Bank Reconciliation", "Fixed Assets & Depreciation",
  "Budget vs Actual", "Financial Year Closing",
];

export function formatInr(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function statusColor(s) {
  const m = {
    pending: "bg-amber-100 text-amber-800",
    due: "bg-orange-100 text-orange-800",
    overdue: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    partial: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    sent: "bg-indigo-100 text-indigo-800",
    approved: "bg-green-100 text-green-800",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

export function agingColor(bucket) {
  const m = {
    "0-30": "bg-green-100 text-green-800",
    "31-60": "bg-amber-100 text-amber-800",
    "61-90": "bg-orange-100 text-orange-800",
    "90+": "bg-red-100 text-red-800",
  };
  return m[bucket] || "bg-slate-100 text-slate-700";
}
