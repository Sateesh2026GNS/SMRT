/** Vendor master demo data and helpers. */

export const VENDOR_STATUSES = ["active", "inactive"];
export const VENDOR_TYPES = ["Manufacturer", "Trader", "Importer", "Service Provider", "Contractor"];
export const VENDOR_CATEGORIES = ["Raw Material", "Consumables", "Machinery", "Packaging", "Services"];
export const MATERIAL_TYPES = ["Steel", "Aluminium", "Plastic", "Chemicals", "Electronics", "General"];
export const PAYMENT_TERMS = ["Net 15", "Net 30", "Net 45", "Net 60", "Advance", "COD"];
export const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Maharashtra", "Tamil Nadu",
  "Gujarat", "Delhi", "Uttar Pradesh", "West Bengal", "Rajasthan",
];

export const WORKFLOW_STEPS = [
  "Create Vendor",
  "Purchase Request",
  "RFQ",
  "Quotation",
  "Purchase Order",
  "GRN",
  "Vendor Bill",
  "Payment",
  "Ledger Update",
];

export const REPORT_TYPES = [
  "Vendor Ledger",
  "Outstanding Report",
  "Purchase Summary",
  "Vendor Performance",
  "Payment History",
  "GST Report",
];

export const IMPORT_TEMPLATE_HEADERS = [
  "vendor_code", "name", "contact", "phone", "email", "gstin", "city", "state",
  "payment_terms", "status", "category", "material_type",
];

export const DEMO_VENDORS = [];

export function enrichApiVendor(row, index = 0) {
  const code = row.vendor_code || `VEN${String(row.id || index + 1).padStart(3, "0")}`;
  return {
    ...row,
    vendor_code: code,
    name: row.name || "Unnamed Vendor",
    contact: row.contact || row.contact_name || "—",
    status: row.status || "active",
    approval_status: row.approval_status || "approved",
    payment_terms: row.payment_terms || "Net 30",
    city: row.city || "—",
    state: row.state || "—",
    gstin: row.gstin || "—",
    outstanding: row.outstanding ?? 0,
    rating: row.rating ?? 4.0,
    category: row.category || "General",
    material_type: row.material_type || "General",
    total_purchase_orders: row.total_purchase_orders ?? 0,
    pending_orders: row.pending_orders ?? 0,
    total_purchase_value: row.total_purchase_value ?? 0,
    last_purchase_date: row.last_purchase_date || "—",
    created_at: row.created_at?.slice?.(0, 10) || new Date().toISOString().slice(0, 10),
  };
}

export function computeVendorSummary(vendors) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "active").length,
    inactive: vendors.filter((v) => v.status !== "active").length,
    pendingApproval: vendors.filter((v) => v.approval_status === "pending").length,
    outstandingPayables: vendors.reduce((s, v) => s + Number(v.outstanding || 0), 0),
    newThisMonth: vendors.filter((v) => {
      const d = new Date(v.created_at);
      return d >= monthStart;
    }).length,
  };
}

export function starRating(rating) {
  const r = Math.round(Number(rating || 0));
  return "★".repeat(Math.min(5, r)) + "☆".repeat(Math.max(0, 5 - r));
}
