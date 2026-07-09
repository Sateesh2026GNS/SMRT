/** BOM master demo data and helpers — UI layer until full bom_headers tables exist. */

export const BOM_STATUSES = ["active", "draft", "inactive", "pending_approval"];
export const BOM_VERSIONS = ["V1.0", "V1.1", "V2.0"];
export const PRODUCT_CATEGORIES = ["Finished Goods", "Semi-Finished", "Assembly", "Sub-Assembly"];

const OFFICE_CHAIR_COMPONENTS = [
  { id: 1, component: "Steel Pipe", item_code: "RM001", category: "Raw Material", unit: "KG", qty: 5, unit_cost: 120, total_cost: 600 },
  { id: 2, component: "Paint", item_code: "RM002", category: "Chemical", unit: "Ltr", qty: 0.5, unit_cost: 250, total_cost: 125 },
  { id: 3, component: "Bolt", item_code: "RM003", category: "Hardware", unit: "Nos", qty: 20, unit_cost: 5, total_cost: 100 },
  { id: 4, component: "Foam Cushion", item_code: "RM004", category: "Raw Material", unit: "Nos", qty: 1, unit_cost: 350, total_cost: 350 },
  { id: 5, component: "Fabric Cover", item_code: "RM005", category: "Raw Material", unit: "Nos", qty: 1, unit_cost: 280, total_cost: 280 },
  { id: 6, component: "Wheel Castor", item_code: "RM006", category: "Hardware", unit: "Nos", qty: 5, unit_cost: 45, total_cost: 225 },
  { id: 7, component: "Gas Lift", item_code: "RM007", category: "Hardware", unit: "Nos", qty: 1, unit_cost: 420, total_cost: 420 },
  { id: 8, component: "Base Plate", item_code: "RM008", category: "Raw Material", unit: "Nos", qty: 1, unit_cost: 180, total_cost: 180 },
  { id: 9, component: "Arm Rest", item_code: "RM009", category: "Semi-Finished", unit: "Nos", qty: 2, unit_cost: 95, total_cost: 190 },
  { id: 10, component: "Label Sticker", item_code: "RM010", category: "Consumables", unit: "Nos", qty: 1, unit_cost: 5, total_cost: 5 },
  { id: 11, component: "Packaging Box", item_code: "RM011", category: "Packaging", unit: "Nos", qty: 1, unit_cost: 60, total_cost: 60 },
  { id: 12, component: "User Manual", item_code: "RM012", category: "Consumables", unit: "Nos", qty: 1, unit_cost: 15, total_cost: 15 },
];

export const DEMO_BOMS = [
  {
    id: "bom-1",
    bom_number: "BOM001",
    product_name: "Office Chair",
    product_code: "PRD010",
    version: "V1.0",
    revision: "R0",
    description: "Standard ergonomic office chair with adjustable height and lumbar support.",
    status: "active",
    category: "Finished Goods",
    warehouse: "FG Store",
    effective_date: "2026-01-01",
    expiry_date: null,
    created_by: "Admin User",
    approved_by: "Priya Production",
    created_date: "2025-12-15",
    last_updated: "Today",
    components: OFFICE_CHAIR_COMPONENTS,
    costing: {
      material_cost: 1500,
      labour_cost: 500,
      machine_cost: 250,
      electricity_cost: 80,
      overhead_cost: 220,
      total_cost: 2550,
    },
    routing: [
      { operation: "Cutting", work_center: "WC001", machine: "Laser Machine", duration: "30 Min" },
      { operation: "Welding", work_center: "WC003", machine: "MIG Welder", duration: "45 Min" },
      { operation: "Painting", work_center: "WC002", machine: "Paint Booth", duration: "20 Min" },
      { operation: "Assembly", work_center: "WC004", machine: "Assembly Line A", duration: "60 Min" },
      { operation: "Packing", work_center: "WC005", machine: "Pack Station", duration: "15 Min" },
    ],
    machines: [
      { name: "Laser Machine", code: "LAS-01", capacity: "200 units/day", operator_required: 1, setup_time: "15 Min" },
      { name: "Paint Booth", code: "PNT-02", capacity: "150 units/day", operator_required: 2, setup_time: "20 Min" },
      { name: "Assembly Line A", code: "ASM-01", capacity: "120 units/day", operator_required: 4, setup_time: "10 Min" },
    ],
    inventory_availability: [
      { component: "Steel Pipe", required: "500 KG", available: "420 KG", status: "low_stock" },
      { component: "Paint", required: "50 L", available: "60 L", status: "available" },
      { component: "Bolt", required: "2000 Nos", available: "3500 Nos", status: "available" },
      { component: "Foam Cushion", required: "100 Nos", available: "85 Nos", status: "low_stock" },
    ],
    documents: [
      { name: "Engineering Drawing", type: "PDF", size: "2.4 MB" },
      { name: "CAD File", type: "DWG", size: "8.1 MB" },
      { name: "Specification Sheet", type: "PDF", size: "1.2 MB" },
      { name: "Assembly Manual", type: "PDF", size: "3.5 MB" },
    ],
    version_history: [
      { version: "V1.0", date: "2026-01-01", changes: "Initial release", author: "Admin User" },
      { version: "V1.1", date: "2026-03-15", changes: "Updated foam cushion spec", author: "Design Team" },
      { version: "V2.0", date: "2026-06-01", changes: "New gas lift component", author: "Engineering" },
    ],
    approval_workflow: [
      { step: "Created", status: "completed", date: "2025-12-15", user: "Admin User" },
      { step: "Submitted", status: "completed", date: "2025-12-16", user: "Admin User" },
      { step: "Reviewed", status: "completed", date: "2025-12-18", user: "QC Manager" },
      { step: "Approved", status: "completed", date: "2025-12-20", user: "Priya Production" },
      { step: "Production", status: "active", date: "2026-01-01", user: "—" },
    ],
    audit: {
      created_by: "Admin User",
      modified_by: "Design Team",
      approved_by: "Priya Production",
      modified_date: "2026-06-01",
      remarks: "Approved for mass production Q3 2026.",
    },
  },
  {
    id: "bom-2",
    bom_number: "BOM002",
    product_name: "Motor",
    product_code: "PRD002",
    version: "V1.0",
    revision: "R1",
    description: "3-phase industrial motor assembly BOM.",
    status: "active",
    category: "Finished Goods",
    warehouse: "Production Store",
    effective_date: "2026-02-01",
    expiry_date: null,
    created_by: "Production Manager",
    approved_by: "Admin User",
    created_date: "2026-01-20",
    last_updated: "2 days ago",
    components: [
      { id: 1, component: "Stator Core", item_code: "RM101", category: "Raw Material", unit: "Nos", qty: 1, unit_cost: 1200, total_cost: 1200 },
      { id: 2, component: "Rotor Assembly", item_code: "RM102", category: "Semi-Finished", unit: "Nos", qty: 1, unit_cost: 980, total_cost: 980 },
      { id: 3, component: "Bearings", item_code: "RM103", category: "Hardware", unit: "Nos", qty: 2, unit_cost: 180, total_cost: 360 },
      { id: 4, component: "Winding Wire", item_code: "RM104", category: "Raw Material", unit: "KG", qty: 3, unit_cost: 450, total_cost: 1350 },
    ],
    costing: { material_cost: 3890, labour_cost: 800, machine_cost: 450, electricity_cost: 120, overhead_cost: 340, total_cost: 5600 },
    routing: [
      { operation: "Winding", work_center: "WC010", machine: "Coil Winder", duration: "90 Min" },
      { operation: "Assembly", work_center: "WC011", machine: "Motor Line", duration: "120 Min" },
      { operation: "Testing", work_center: "WC012", machine: "Test Bench", duration: "30 Min" },
    ],
    machines: [
      { name: "Coil Winder", code: "CW-01", capacity: "40 units/day", operator_required: 2, setup_time: "30 Min" },
      { name: "Motor Line", code: "ML-01", capacity: "35 units/day", operator_required: 5, setup_time: "20 Min" },
    ],
    inventory_availability: [
      { component: "Stator Core", required: "50 Nos", available: "62 Nos", status: "available" },
      { component: "Winding Wire", required: "150 KG", available: "200 KG", status: "available" },
    ],
    documents: [{ name: "Motor Spec Sheet", type: "PDF", size: "1.8 MB" }],
    version_history: [{ version: "V1.0", date: "2026-02-01", changes: "Initial BOM", author: "Production Manager" }],
    approval_workflow: [
      { step: "Created", status: "completed", date: "2026-01-20", user: "Production Manager" },
      { step: "Submitted", status: "completed", date: "2026-01-21", user: "Production Manager" },
      { step: "Reviewed", status: "completed", date: "2026-01-22", user: "QC Manager" },
      { step: "Approved", status: "completed", date: "2026-01-25", user: "Admin User" },
      { step: "Production", status: "active", date: "2026-02-01", user: "—" },
    ],
    audit: { created_by: "Production Manager", modified_by: "Production Manager", approved_by: "Admin User", modified_date: "2026-02-01", remarks: "Standard motor BOM." },
  },
  {
    id: "bom-3",
    bom_number: "BOM003",
    product_name: "Hydraulic Valve",
    product_code: "PRD003",
    version: "V1.0",
    revision: "R0",
    description: "Precision valve — draft BOM pending review.",
    status: "draft",
    category: "Finished Goods",
    warehouse: "Production Store",
    effective_date: null,
    expiry_date: null,
    created_by: "Design Team",
    approved_by: "—",
    created_date: "2026-06-28",
    last_updated: "1 week ago",
    components: [
      { id: 1, component: "Valve Body", item_code: "RM201", category: "Raw Material", unit: "Nos", qty: 1, unit_cost: 800, total_cost: 800 },
      { id: 2, component: "Seal Kit", item_code: "RM202", category: "Hardware", unit: "Set", qty: 1, unit_cost: 120, total_cost: 120 },
    ],
    costing: { material_cost: 920, labour_cost: 300, machine_cost: 180, electricity_cost: 50, overhead_cost: 150, total_cost: 1600 },
    routing: [{ operation: "Machining", work_center: "WC020", machine: "VMC-01", duration: "45 Min" }],
    machines: [{ name: "VMC-01", code: "VMC-01", capacity: "80 units/day", operator_required: 1, setup_time: "25 Min" }],
    inventory_availability: [{ component: "Valve Body", required: "30 Nos", available: "28 Nos", status: "low_stock" }],
    documents: [],
    version_history: [{ version: "V1.0", date: "2026-06-28", changes: "Draft created", author: "Design Team" }],
    approval_workflow: [
      { step: "Created", status: "completed", date: "2026-06-28", user: "Design Team" },
      { step: "Submitted", status: "pending", date: "—", user: "—" },
      { step: "Reviewed", status: "pending", date: "—", user: "—" },
      { step: "Approved", status: "pending", date: "—", user: "—" },
      { step: "Production", status: "pending", date: "—", user: "—" },
    ],
    audit: { created_by: "Design Team", modified_by: "Design Team", approved_by: "—", modified_date: "2026-06-28", remarks: "Awaiting engineering review." },
  },
  {
    id: "bom-4",
    bom_number: "BOM004",
    product_name: "Steel Rod",
    product_code: "PRD001",
    version: "V1.0",
    revision: "R0",
    description: "Raw material — no BOM required.",
    status: "inactive",
    category: "Raw Material",
    warehouse: "Main Store",
    effective_date: "2025-06-01",
    expiry_date: "2026-12-31",
    created_by: "Store Manager",
    approved_by: "Admin User",
    created_date: "2025-05-01",
    last_updated: "3 months ago",
    components: [],
    costing: { material_cost: 0, labour_cost: 0, machine_cost: 0, electricity_cost: 0, overhead_cost: 0, total_cost: 0 },
    routing: [],
    machines: [],
    inventory_availability: [],
    documents: [],
    version_history: [],
    approval_workflow: [],
    audit: { created_by: "Store Manager", modified_by: "Admin User", approved_by: "Admin User", modified_date: "2025-06-01", remarks: "Marked inactive — raw material." },
  },
];

export function computeBomSummary(boms) {
  return {
    total: boms.length,
    active: boms.filter((b) => b.status === "active").length,
    draft: boms.filter((b) => b.status === "draft").length,
    inactive: boms.filter((b) => b.status === "inactive").length,
    withoutBom: 2,
    pendingApproval: boms.filter((b) => b.status === "pending_approval" || (b.status === "draft" && b.approval_workflow?.some((s) => s.step === "Submitted" && s.status === "pending"))).length,
  };
}

export function groupApiBomRows(rows) {
  const groups = {};
  for (const row of rows) {
    const key = row.product_sku || row.product;
    if (!groups[key]) {
      groups[key] = {
        product: row.product,
        product_sku: row.product_sku,
        components: [],
      };
    }
    groups[key].components.push({
      id: row.id,
      component: row.component,
      item_code: row.component_sku,
      category: "Raw Material",
      unit: row.unit,
      qty: row.quantity,
      unit_cost: 0,
      total_cost: 0,
    });
  }
  return Object.entries(groups).map(([sku, g], i) => {
    const materialCost = g.components.reduce((s, c) => s + (c.total_cost || 0), 0);
    return {
      id: `api-${i}`,
      bom_number: `BOM${String(i + 10).padStart(3, "0")}`,
      product_name: g.product,
      product_code: sku,
      version: "V1.0",
      revision: "R0",
      description: `BOM for ${g.product}`,
      status: "active",
      category: "Finished Goods",
      warehouse: "Main Store",
      effective_date: new Date().toISOString().slice(0, 10),
      expiry_date: null,
      created_by: "System",
      approved_by: "—",
      created_date: new Date().toISOString().slice(0, 10),
      last_updated: "Recently",
      components: g.components,
      costing: {
        material_cost: materialCost,
        labour_cost: Math.round(materialCost * 0.2),
        machine_cost: Math.round(materialCost * 0.1),
        electricity_cost: Math.round(materialCost * 0.05),
        overhead_cost: Math.round(materialCost * 0.08),
        total_cost: Math.round(materialCost * 1.43),
      },
      routing: [],
      machines: [],
      inventory_availability: g.components.map((c) => ({
        component: c.component,
        required: `${c.qty} ${c.unit}`,
        available: "—",
        status: "available",
      })),
      documents: [],
      version_history: [{ version: "V1.0", date: new Date().toISOString().slice(0, 10), changes: "Imported from API", author: "System" }],
      approval_workflow: [
        { step: "Created", status: "completed", date: new Date().toISOString().slice(0, 10), user: "System" },
        { step: "Approved", status: "completed", date: new Date().toISOString().slice(0, 10), user: "—" },
        { step: "Production", status: "active", date: new Date().toISOString().slice(0, 10), user: "—" },
      ],
      audit: { created_by: "System", modified_by: "—", approved_by: "—", modified_date: new Date().toISOString().slice(0, 10), remarks: "Auto-generated from BOM lines." },
    };
  });
}

export const IMPORT_TEMPLATE_HEADERS = [
  "bom_number",
  "product_name",
  "product_code",
  "version",
  "component",
  "item_code",
  "qty",
  "unit",
  "unit_cost",
];

export const REPORT_TYPES = [
  "BOM Cost Report",
  "Material Requirement Report",
  "BOM Comparison",
  "Revision History",
  "Component Usage Report",
];
