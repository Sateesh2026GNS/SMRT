/** Customer master demo data and helpers. */

export const CUSTOMER_STATUSES = ["active", "inactive"];
export const CUSTOMER_TYPES = ["Corporate", "Retail", "Distributor", "OEM", "Government"];
export const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Maharashtra", "Tamil Nadu",
  "Gujarat", "Delhi", "Uttar Pradesh", "West Bengal", "Rajasthan",
];
export const SALES_EXECUTIVES = ["Ravi Kumar", "Anita Sharma", "Suresh Reddy", "Priya Nair"];

export const DEMO_CUSTOMERS = [];

export function enrichApiCustomer(row, index = 0) {
  const code = `CUS${String(row.id).padStart(3, "0")}`;
  const city = ["Hyderabad", "Pune", "Chennai", "Mumbai", "Bengaluru"][index % 5];
  return {
    id: row.id,
    customer_code: code,
    company: row.name,
    name: row.name,
    contact_person: row.contact_name || "—",
    phone: row.phone || "—",
    email: row.email || "—",
    gstin: row.gstin || "—",
    city,
    state: row.state || INDIAN_STATES[index % INDIAN_STATES.length],
    district: city,
    pincode: "500001",
    country: "India",
    status: "active",
    customer_type: CUSTOMER_TYPES[index % CUSTOMER_TYPES.length],
    industry: "Manufacturing",
    pan: row.gstin ? row.gstin.slice(2, 12) : "—",
    website: null,
    alternate_phone: null,
    designation: "Contact",
    billing_address: row.address_line1 || "—",
    shipping_address: row.address_line1 || "—",
    credit_limit: 1000000 + index * 200000,
    payment_terms: "Net 30",
    outstanding: 50000 + index * 35000,
    opening_balance: 0,
    currency: "INR",
    tan: null,
    msme: null,
    sales_executive: SALES_EXECUTIVES[index % SALES_EXECUTIVES.length],
    price_list: "Standard",
    discount_percent: 5,
    sales_territory: row.state || "India",
    pending_payments: index % 3 === 0 ? 1 : 0,
    total_orders: 5 + index * 3,
    total_sales: 500000 + index * 100000,
    pending_orders: index % 2,
    last_order: "2026-06-15",
    last_payment: "2026-06-01",
    created_at: new Date().toISOString().slice(0, 10),
    documents: [],
  };
}

export function computeCustomerSummary(customers) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const newThisMonth = customers.filter((c) => {
    if (!c.created_at) return false;
    const d = new Date(c.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  return {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    inactive: customers.filter((c) => c.status === "inactive").length,
    newThisMonth,
    pendingPayments: customers.reduce((s, c) => s + (c.pending_payments || 0), 0),
    outstandingAmount: customers.reduce((s, c) => s + (c.outstanding || 0), 0),
  };
}

export const REPORT_TYPES = [
  "Customer Ledger",
  "Customer Aging Report",
  "Outstanding Report",
  "Sales Report",
  "Payment Report",
];

export const IMPORT_TEMPLATE_HEADERS = [
  "customer_code", "company", "contact_person", "phone", "email",
  "gstin", "city", "state", "credit_limit", "status",
];

export const WORKFLOW_STEPS = [
  "Create Customer", "Create Quotation", "Sales Order", "Dispatch",
  "Invoice", "Payment", "Ledger Updated",
];
