/** Extended product master fields — merged with API catalog rows in the UI. */

export const PRODUCT_CATEGORIES = [
  "Raw Material",
  "WIP",
  "Finished Goods",
  "Consumables",
  "Spare Parts",
];

export const PRODUCT_TYPES = ["Raw Material", "Semi-Finished", "Finished Goods", "Service"];

export const PRODUCT_STATUSES = ["active", "inactive"];

export const WAREHOUSES = ["Main Store", "Production Store", "FG Store", "QC Store"];

export const BRANDS = ["Tata Steel", "Bosch", "Siemens", "Local", "Generic"];

export const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    product_code: "PRD001",
    name: "Steel Rod",
    category: "Raw Material",
    product_type: "Raw Material",
    sku: "STL-001",
    barcode: "8901234567890",
    brand: "Tata Steel",
    unit: "KG",
    hsn_code: "7214",
    gst_percent: 18,
    purchase_price: 95,
    selling_price: 120,
    min_stock: 100,
    max_stock: 1000,
    current_stock: 500,
    warehouse: "Main Store",
    description: "High-grade steel rod for machining and fabrication.",
    status: "active",
    bom: "BOM-STL-001",
    production_time: "—",
    machine_required: "—",
    quality_standard: "IS 2062",
    batch_tracking: false,
    serial_number: false,
    expiry_date: null,
    units_sold: 1240,
    stock_value: 60000,
    created_at: "2026-05-12",
  },
  {
    id: "demo-2",
    product_code: "PRD002",
    name: "Motor",
    category: "Finished Goods",
    product_type: "Finished Goods",
    sku: "MTR-002",
    barcode: "8901234567891",
    brand: "Bosch",
    unit: "Nos",
    hsn_code: "8501",
    gst_percent: 18,
    purchase_price: 4200,
    selling_price: 5000,
    min_stock: 10,
    max_stock: 100,
    current_stock: 25,
    warehouse: "FG Store",
    description: "3-phase industrial motor 5 HP.",
    status: "active",
    bom: "BOM-MTR-002",
    production_time: "4 hrs",
    machine_required: "Assembly Line A",
    quality_standard: "ISO 9001",
    batch_tracking: true,
    serial_number: true,
    expiry_date: null,
    units_sold: 86,
    stock_value: 125000,
    created_at: "2026-06-01",
  },
  {
    id: "demo-3",
    product_code: "PRD003",
    name: "Hydraulic Valve",
    category: "Finished Goods",
    product_type: "Finished Goods",
    sku: "HYD-003",
    barcode: "8901234567892",
    brand: "Siemens",
    unit: "Nos",
    hsn_code: "8481",
    gst_percent: 18,
    purchase_price: 2800,
    selling_price: 3500,
    min_stock: 15,
    max_stock: 80,
    current_stock: 8,
    warehouse: "FG Store",
    description: "Precision hydraulic control valve.",
    status: "active",
    bom: "BOM-HYD-003",
    production_time: "3 hrs",
    machine_required: "VMC-01",
    quality_standard: "ISO 9001",
    batch_tracking: true,
    serial_number: true,
    expiry_date: null,
    units_sold: 142,
    stock_value: 28000,
    created_at: "2026-06-10",
  },
  {
    id: "demo-4",
    product_code: "PRD004",
    name: "Lubricant Oil",
    category: "Consumables",
    product_type: "Raw Material",
    sku: "LUB-004",
    barcode: "8901234567893",
    brand: "Local",
    unit: "Ltr",
    hsn_code: "2710",
    gst_percent: 18,
    purchase_price: 180,
    selling_price: 220,
    min_stock: 50,
    max_stock: 500,
    current_stock: 0,
    warehouse: "Main Store",
    description: "Machine-grade lubricant oil.",
    status: "inactive",
    bom: "—",
    production_time: "—",
    machine_required: "—",
    quality_standard: "—",
    batch_tracking: false,
    serial_number: false,
    expiry_date: "2027-06-30",
    units_sold: 320,
    stock_value: 0,
    created_at: "2026-04-20",
  },
  {
    id: "demo-5",
    product_code: "PRD005",
    name: "Bearing Assembly",
    category: "Spare Parts",
    product_type: "Semi-Finished",
    sku: "BRG-005",
    barcode: "8901234567894",
    brand: "Generic",
    unit: "Nos",
    hsn_code: "8482",
    gst_percent: 18,
    purchase_price: 450,
    selling_price: 580,
    min_stock: 20,
    max_stock: 200,
    current_stock: 12,
    warehouse: "Production Store",
    description: "Standard bearing assembly for CNC spindles.",
    status: "active",
    bom: "BOM-BRG-005",
    production_time: "1.5 hrs",
    machine_required: "LATHE-01",
    quality_standard: "ISO 9001",
    batch_tracking: true,
    serial_number: false,
    expiry_date: null,
    units_sold: 210,
    stock_value: 6960,
    created_at: "2026-06-15",
  },
];

export function guessCategory(sku = "", name = "") {
  const s = `${sku} ${name}`.toLowerCase();
  if (s.includes("part") || s.includes("stl") || s.includes("raw")) return "Raw Material";
  if (s.includes("widget") || s.includes("motor") || s.includes("valve")) return "Finished Goods";
  if (s.includes("lub") || s.includes("oil")) return "Consumables";
  return "Finished Goods";
}

export function enrichApiProduct(apiRow, index = 0) {
  const category = guessCategory(apiRow.sku, apiRow.name);
  const stock = 50 + ((apiRow.id || index) * 37) % 450;
  const minStock = 20;
  return {
    id: apiRow.id,
    product_code: `PRD${String(apiRow.id).padStart(3, "0")}`,
    name: apiRow.name,
    category,
    product_type: category === "Raw Material" ? "Raw Material" : "Finished Goods",
    sku: apiRow.sku,
    barcode: `890${String(apiRow.id).padStart(10, "0")}`,
    brand: BRANDS[index % BRANDS.length],
    unit: category === "Raw Material" ? "KG" : "Nos",
    hsn_code: "—",
    gst_percent: 18,
    purchase_price: apiRow.unit_cost ?? 0,
    selling_price: apiRow.unit_price ?? 0,
    min_stock: minStock,
    max_stock: minStock * 10,
    current_stock: stock,
    warehouse: WAREHOUSES[index % WAREHOUSES.length],
    description: apiRow.description || "",
    status: "active",
    bom: `BOM-${apiRow.sku}`,
    production_time: category === "Raw Material" ? "—" : "2 hrs",
    machine_required: category === "Raw Material" ? "—" : "CNC-01",
    quality_standard: "ISO 9001",
    batch_tracking: category !== "Raw Material",
    serial_number: false,
    expiry_date: null,
    units_sold: 50 + index * 30,
    stock_value: stock * (apiRow.unit_price ?? 100),
    created_at: new Date().toISOString().slice(0, 10),
  };
}

export function computeSummary(products) {
  const categories = new Set(products.map((p) => p.category));
  return {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status === "inactive").length,
    lowStock: products.filter((p) => p.current_stock > 0 && p.current_stock <= p.min_stock).length,
    outOfStock: products.filter((p) => p.current_stock === 0).length,
    categories: categories.size,
  };
}

export function computeQuickStats(products) {
  if (!products.length) {
    return {
      mostSold: "—",
      highestStock: "—",
      lowestStock: "—",
      recentlyAdded: "—",
      pendingApproval: 0,
    };
  }
  const mostSold = [...products].sort((a, b) => (b.units_sold || 0) - (a.units_sold || 0))[0];
  const highest = [...products].sort((a, b) => b.current_stock - a.current_stock)[0];
  const lowest = [...products].filter((p) => p.current_stock > 0).sort((a, b) => a.current_stock - b.current_stock)[0];
  const recent = [...products].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))[0];
  return {
    mostSold: mostSold?.name || "—",
    highestStock: highest ? `${highest.name} (${highest.current_stock})` : "—",
    lowestStock: lowest ? `${lowest.name} (${lowest.current_stock})` : "—",
    recentlyAdded: recent?.name || "—",
    pendingApproval: products.filter((p) => p.status === "inactive").length,
  };
}

export const categoryChartData = [
  { name: "Raw Material", value: 35, color: "#3B82F6" },
  { name: "Finished Goods", value: 28, color: "#22C55E" },
  { name: "WIP", value: 12, color: "#F97316" },
  { name: "Consumables", value: 15, color: "#A855F7" },
  { name: "Spare Parts", value: 10, color: "#64748B" },
];

export const IMPORT_TEMPLATE_HEADERS = [
  "product_code",
  "name",
  "category",
  "sku",
  "unit",
  "purchase_price",
  "selling_price",
  "min_stock",
  "max_stock",
  "warehouse",
  "status",
];
