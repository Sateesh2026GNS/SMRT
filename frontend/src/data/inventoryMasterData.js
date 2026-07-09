/** Inventory module demo data and helpers. */

export const MATERIAL_CATEGORIES = ["Metals", "Plastics", "Electronics", "Chemicals", "Packaging", "Fasteners"];
export const WAREHOUSES = ["Main Warehouse", "Raw Material Store", "Plant-1 Store", "Plant-2 Store"];
export const ADJUSTMENT_REASONS = [
  "Physical Count", "Damage", "Loss", "Scrap", "Expired", "Return", "Correction",
];
export const TRANSFER_STATUSES = ["draft", "pending_approval", "approved", "in_transit", "received", "completed"];
export const TRANSACTION_TYPES = ["Purchase", "Production", "Transfer", "Adjustment", "Sales", "Return", "Scrap"];

export const INVENTORY_FLOW = [
  "Vendor", "Purchase Order", "GRN", "Raw Material Inventory", "Material Issue",
  "Production", "Finished Goods", "Warehouse", "Sales Order", "Dispatch", "Customer",
];

export const DEMO_MATERIALS_SUMMARY = {
  total_items: 1250,
  available_stock: 980,
  low_stock: 42,
  out_of_stock: 8,
  stock_value: 18_000_000,
  expiring_soon: 12,
};

export const DEMO_MATERIALS = [
  { id: "dm1", sku: "RM-001", name: "Steel Sheet 2mm", category: "Metals", warehouse_name: "Raw Material Store", batch_number: "BATCH-1001", quantity: 2500, reserved: 200, available: 2300, unit: "kg", reorder_level: 500, unit_cost: 85, stock_value: 212500, status: "available", barcode: "8901234567001", vendor_name: "Tata Steel" },
  { id: "dm2", sku: "RM-002", name: "ABS Plastic Granules", category: "Plastics", warehouse_name: "Main Warehouse", batch_number: "BATCH-1002", quantity: 180, reserved: 30, available: 150, unit: "kg", reorder_level: 200, unit_cost: 120, stock_value: 21600, status: "low_stock", barcode: "8901234567002", vendor_name: "Reliance Polymers" },
  { id: "dm3", sku: "RM-003", name: "Bearing 6205", category: "Fasteners", warehouse_name: "Plant-1 Store", batch_number: "BATCH-1003", quantity: 0, reserved: 0, available: 0, unit: "pcs", reorder_level: 100, unit_cost: 45, stock_value: 0, status: "out_of_stock", barcode: "8901234567003", vendor_name: "SKF India" },
  { id: "dm4", sku: "RM-004", name: "Hydraulic Oil", category: "Chemicals", warehouse_name: "Main Warehouse", batch_number: "BATCH-1004", quantity: 450, reserved: 50, available: 400, unit: "L", reorder_level: 100, unit_cost: 280, stock_value: 126000, status: "available", barcode: "8901234567004", vendor_name: "Castrol" },
  { id: "dm5", sku: "RM-005", name: "PCB Board v2", category: "Electronics", warehouse_name: "Plant-2 Store", batch_number: "BATCH-1005", quantity: 320, reserved: 80, available: 240, unit: "pcs", reorder_level: 150, unit_cost: 650, stock_value: 208000, status: "available", barcode: "8901234567005", vendor_name: "Bosch Electronics" },
];

export const DEMO_FG_SUMMARY = {
  total_products: 85,
  available: 62,
  reserved: 18,
  ready_to_dispatch: 45,
  damaged: 3,
  stock_value: 2_400_000,
};

export const DEMO_FINISHED_GOODS = [
  { id: "fg1", sku: "FG-001", name: "Chair Assembly", batch_number: "FG-BATCH-001", quantity: 500, reserved: 60, available: 440, warehouse_name: "Finished Goods WH", customer_name: "Tata Motors", status: "ready", production_date: "2026-07-08", expiry_date: "2027-07-08", warranty: "12 months", serial_number: "SN-000001", qr_code: "QR-FG-001" },
  { id: "fg2", sku: "FG-002", name: "Table Top", batch_number: "FG-BATCH-002", quantity: 280, reserved: 40, available: 240, warehouse_name: "Finished Goods WH", customer_name: "Bosch India", status: "ready", production_date: "2026-07-09", expiry_date: "2027-07-09", warranty: "12 months", serial_number: "SN-000002", qr_code: "QR-FG-002" },
  { id: "fg3", sku: "FG-003", name: "Steel Frame", batch_number: "FG-BATCH-003", quantity: 0, reserved: 0, available: 0, warehouse_name: "Finished Goods WH", customer_name: "Mahindra", status: "out_of_stock", production_date: "2026-07-05", expiry_date: "2027-07-05", warranty: "24 months", serial_number: "SN-000003", qr_code: "QR-FG-003" },
];

export const DEMO_TRANSFERS = [
  { id: "tr1", transfer_number: "TRF-2026-0001", transfer_date: "2026-07-09", from_warehouse: "Main Warehouse", to_warehouse: "Plant-1 Store", item_name: "Steel Sheet 2mm", batch_number: "BATCH-1001", quantity: 500, status: "in_transit", approved_by: "Ramesh Kumar", vehicle: "MH-12-AB-1234", driver: "Suresh" },
  { id: "tr2", transfer_number: "TRF-2026-0002", transfer_date: "2026-07-08", from_warehouse: "Raw Material Store", to_warehouse: "Plant-2 Store", item_name: "PCB Board v2", batch_number: "BATCH-1005", quantity: 100, status: "completed", approved_by: "Anita Desai", vehicle: "MH-14-CD-5678", driver: "Ravi" },
  { id: "tr3", transfer_number: "TRF-2026-0003", transfer_date: "2026-07-07", from_warehouse: "Main Warehouse", to_warehouse: "Finished Goods WH", item_name: "Chair Assembly", batch_number: "FG-BATCH-001", quantity: 200, status: "pending_approval", approved_by: null, vehicle: null, driver: null },
];

export const DEMO_ADJUSTMENTS = [
  { id: "adj1", adjustment_date: "2026-07-09", warehouse_name: "Main Warehouse", item_name: "ABS Plastic Granules", old_qty: 200, new_qty: 180, difference: -20, reason: "Damage", status: "approved", approved_by: "Store Manager" },
  { id: "adj2", adjustment_date: "2026-07-08", warehouse_name: "Plant-1 Store", item_name: "Bearing 6205", old_qty: 150, new_qty: 148, difference: -2, reason: "Physical Count", status: "pending", approved_by: null },
  { id: "adj3", adjustment_date: "2026-07-07", warehouse_name: "Raw Material Store", item_name: "Hydraulic Oil", old_qty: 400, new_qty: 450, difference: 50, reason: "Return", status: "approved", approved_by: "Inventory Manager" },
];

export const DEMO_LEDGER_SUMMARY = {
  total_transactions: 2450,
  stock_in: 1250,
  stock_out: 980,
  transfers: 45,
  adjustments: 28,
  current_stock_value: 18_000_000,
};

export const DEMO_LEDGER = [
  { id: "lg1", date: "2026-07-09T10:30:00", transaction: "purchase", warehouse_name: "Main Warehouse", item_name: "Steel Sheet 2mm", batch_number: "BATCH-1001", qty_in: 500, qty_out: 0, balance: 2500, user_name: "Ramesh Kumar", reference: "GRN-2026-045" },
  { id: "lg2", date: "2026-07-09T09:15:00", transaction: "production", warehouse_name: "Raw Material Store", item_name: "ABS Plastic Granules", batch_number: "BATCH-1002", qty_in: 0, qty_out: 120, balance: 180, user_name: "System", reference: "WO-1001" },
  { id: "lg3", date: "2026-07-08T16:00:00", transaction: "transfer", warehouse_name: "Plant-1 Store", item_name: "PCB Board v2", batch_number: "BATCH-1005", qty_in: 100, qty_out: 0, balance: 320, user_name: "Mahesh Patel", reference: "TRF-2026-0002" },
  { id: "lg4", date: "2026-07-08T14:30:00", transaction: "adjustment", warehouse_name: "Main Warehouse", item_name: "ABS Plastic Granules", batch_number: "BATCH-1002", qty_in: 0, qty_out: 20, balance: 180, user_name: "Store Executive", reference: "ADJ-2026-07-08" },
];

export const DEMO_INVENTORY_HUB = {
  total_inventory_value: 20_400_000,
  low_stock_items: 42,
  dead_stock: 5,
  fast_moving: 18,
  slow_moving: 12,
  todays_transactions: 34,
  warehouse_stock: [
    { name: "Main Warehouse", quantity: 8500 },
    { name: "Raw Material Store", quantity: 4200 },
    { name: "Finished Goods WH", quantity: 2800 },
    { name: "Plant-1 Store", quantity: 1500 },
  ],
  top_materials: [
    { name: "Steel Sheet 2mm", qty: 2500 },
    { name: "Hydraulic Oil", qty: 450 },
    { name: "PCB Board v2", qty: 320 },
    { name: "Chair Assembly", qty: 500 },
  ],
};

export function formatInr(value) {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)} L`;
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function stockStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "available" || s === "ready") return "bg-green-100 text-green-800";
  if (s === "low_stock") return "bg-amber-100 text-amber-800";
  if (s === "out_of_stock") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-700";
}

export function stockStatusLabel(status) {
  const map = { available: "Available", low_stock: "Low Stock", out_of_stock: "Out of Stock", ready: "Ready" };
  return map[status] || status;
}

export const DEMO_MATERIAL_DETAIL = {
  id: "dm1",
  sku: "RM-001",
  name: "Steel Sheet 2mm",
  barcode: "8901234567001",
  category: "Metals",
  unit: "kg",
  unit_cost: 85,
  reorder_level: 500,
  description: "Cold rolled steel sheet 2mm thickness",
  vendor_name: "Tata Steel",
  vendor_contact: "Ramesh Kumar",
  vendor_email: "supply@tatasteel.com",
  stock_history: [
    { date: "2026-07-09", warehouse: "Main Warehouse", type: "in", quantity: 500, reference: "GRN-045" },
    { date: "2026-07-08", warehouse: "Plant-1", type: "out", quantity: 120, reference: "WO-1001" },
  ],
  purchase_history: [{ po: "PO-2026-1001", qty: 500, date: "2026-07-01" }],
  consumption_history: [{ wo: "WO-1001", qty: 120, date: "2026-07-09" }],
  batches: [{ batch: "BATCH-1001", qty: 2500 }],
};
