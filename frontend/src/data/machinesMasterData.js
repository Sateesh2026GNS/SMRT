/** Machine master demo data and helpers. */

export const MACHINE_STATUSES = ["running", "idle", "maintenance", "breakdown", "offline"];
export const MACHINE_TYPES = ["CNC", "Lathe", "Milling", "Injection Molding", "Press", "Assembly", "Welding", "Packaging"];
export const DEPARTMENTS = ["Machining", "Assembly", "Fabrication", "Quality", "Packaging", "Maintenance"];
export const PRODUCTION_LINES = ["Line A", "Line B", "Line C", "Line D", "Line E"];
export const WORK_CENTERS = ["WC-01", "WC-02", "WC-03", "WC-04", "WC-05", "WC-06"];
export const SHIFTS = ["Shift A", "Shift B", "Shift C"];
export const OPERATORS = [
  "Ravi Kumar", "Priya Sharma", "Suresh Reddy", "Anita Desai", "Vikram Singh",
  "Kiran Patel", "Meena Rao", "Arjun Nair", "Deepak Joshi", "Lakshmi Iyer",
];

export const STATUS_COLORS = {
  running: { dot: "🟢", bg: "bg-green-100", text: "text-green-800", border: "border-green-200", ring: "bg-green-500" },
  idle: { dot: "🟡", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200", ring: "bg-yellow-500" },
  breakdown: { dot: "🔴", bg: "bg-red-100", text: "text-red-800", border: "border-red-200", ring: "bg-red-500" },
  maintenance: { dot: "🔵", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", ring: "bg-blue-500" },
  offline: { dot: "⚫", bg: "bg-slate-200", text: "text-slate-700", border: "border-slate-300", ring: "bg-slate-500" },
};

export const WORKFLOW_STEPS = [
  "Machine",
  "Assign Work Order",
  "Operator Login",
  "Production",
  "Quality Check",
  "Finished Goods",
  "Maintenance",
];

export const IMPORT_TEMPLATE_HEADERS = [
  "code", "name", "machine_type", "department", "production_line", "work_center",
  "status", "assigned_operator", "current_shift", "manufacturer", "model_name",
];

const STATUS_CYCLE = ["running", "running", "running", "idle", "idle", "maintenance", "breakdown", "offline"];
const MANUFACTURERS = ["DMG Mori", "Haas", "Fanuc", "Siemens", "Mazak", "Amada", "ABB", "Bosch"];

function buildDemoMachine(i) {
  const n = i + 1;
  const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const line = PRODUCTION_LINES[i % PRODUCTION_LINES.length];
  const type = MACHINE_TYPES[i % MACHINE_TYPES.length];
  const operator = status === "offline" ? null : OPERATORS[i % OPERATORS.length];
  const shift = SHIFTS[i % SHIFTS.length];
  const efficiency = status === "running" ? 75 + (i % 20) : status === "idle" ? 0 : status === "breakdown" ? 0 : 40 + (i % 30);
  const health = status === "breakdown" ? 35 + (i % 15) : 70 + (i % 28);
  const oee = status === "running" ? 65 + (i % 25) : 0;
  const output = status === "running" ? 120 + (i * 8) : status === "idle" ? 0 : 0;
  const target = status === "running" ? 200 + (i * 5) : 0;

  return {
    id: `demo-${n}`,
    code: `MCH${String(n).padStart(3, "0")}`,
    name: `${type} Unit ${n}`,
    machine_type: type,
    department: dept,
    production_line: line,
    work_center: WORK_CENTERS[i % WORK_CENTERS.length],
    status,
    display_status: status,
    location: `Plant 1 · ${line}`,
    plant_code: "PLT-01",
    is_active: status !== "offline",
    manufacturer: MANUFACTURERS[i % MANUFACTURERS.length],
    model_name: `${type}-${100 + n}`,
    serial_number: `SN-${2020 + (i % 5)}-${String(n).padStart(4, "0")}`,
    purchase_date: `202${i % 4}-0${(i % 9) + 1}-15`,
    warranty_until: `202${(i % 4) + 6}-12-31`,
    assigned_operator: operator,
    current_shift: shift,
    current_work_order: status === "running" ? `WO-2026-${String(1000 + n)}` : null,
    current_product: status === "running" ? `Product-${String.fromCharCode(65 + (i % 5))}${n}` : null,
    health_score: health,
    efficiency_pct: efficiency,
    oee_pct: oee,
    temperature_c: status === "running" ? 42 + (i % 18) : null,
    rpm: status === "running" ? 1200 + (i * 50) : 0,
    todays_output: output,
    target_quantity: target,
    last_maintenance_date: `2026-0${(i % 6) + 1}-10`,
    next_maintenance_date: `2026-0${((i % 6) + 7) % 12 + 1}-10`,
    downtime_minutes: status === "breakdown" ? 45 + (i * 3) : i % 5 === 0 ? 20 : 0,
    energy_kwh: status === "running" ? 12 + (i % 8) : null,
    availability_pct: 85 + (i % 10),
    performance_pct: oee || 0,
    quality_pct: health,
    login_time: operator ? `06:${String((i % 50) + 10).padStart(2, "0")}` : null,
    work_orders: status === "running" ? [
      { id: n, work_order_number: `WO-2026-${1000 + n}`, status: "in_progress", planned_quantity: target, actual_quantity: output },
    ] : [],
    maintenance_history: [
      { id: n * 10, maintenance_date: `2026-0${(i % 6) + 1}-10`, maintenance_type: "Preventive", description: "Routine inspection", performed_by: "Maintenance Team" },
    ],
    status_logs: [
      { id: n, status, started_at: new Date().toISOString(), reason: status === "breakdown" ? "Motor fault" : null },
    ],
    documents: [
      { name: "Machine Manual", type: "PDF" },
      { name: "AMC Contract", type: "PDF" },
    ],
    audit_logs: [
      { action: "Status Change", user: "System", timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") },
    ],
    iot: {
      temperature: status === "running" ? 42 + (i % 18) : null,
      rpm: status === "running" ? 1200 + (i * 50) : 0,
      vibration: status === "running" ? 0.2 + (i % 5) * 0.1 : null,
      power_kw: status === "running" ? 8 + (i % 4) : 0,
      health: health,
      running_time_hrs: status === "running" ? 5 + (i % 3) : 0,
      downtime_hrs: status === "breakdown" ? 1.5 : 0,
    },
  };
}

export const DEMO_MACHINES = [];

export function normalizeStatus(machine) {
  if (!machine.is_active && machine.is_active !== undefined) return "offline";
  const s = (machine.display_status || machine.status || "idle").toLowerCase();
  if (["down", "fault", "breakdown"].includes(s)) return "breakdown";
  if (MACHINE_STATUSES.includes(s)) return s;
  return "idle";
}

export function enrichApiMachine(row, index = 0) {
  const status = normalizeStatus(row);
  return {
    ...row,
    code: row.code || `MCH${String(row.id || index + 1).padStart(3, "0")}`,
    name: row.name || "Unnamed Machine",
    machine_type: row.machine_type || "CNC",
    department: row.department || "Machining",
    production_line: row.production_line || "Line A",
    work_center: row.work_center || "WC-01",
    display_status: status,
    status,
    assigned_operator: row.assigned_operator || "—",
    current_shift: row.current_shift || "Shift A",
    current_work_order: row.current_work_order || null,
    current_product: row.current_product || null,
    health_score: row.health_score ?? 85,
    efficiency_pct: row.efficiency_pct ?? 0,
    oee_pct: row.oee_pct ?? 0,
    temperature_c: row.temperature_c ?? null,
    todays_output: row.todays_output ?? 0,
    target_quantity: row.target_quantity ?? 0,
    last_maintenance_date: row.last_maintenance_date || "—",
    next_maintenance_date: row.next_maintenance_date || "—",
    location: row.location || "Plant 1",
    manufacturer: row.manufacturer || "—",
    model_name: row.model_name || "—",
    serial_number: row.serial_number || "—",
    purchase_date: row.purchase_date || "—",
    warranty_until: row.warranty_until || "—",
    work_orders: row.work_orders || [],
    maintenance_history: row.maintenance_history || [],
    status_logs: row.status_logs || [],
    documents: row.documents || [],
    audit_logs: row.audit_logs || [],
    iot: row.iot || {
      temperature: row.temperature_c,
      rpm: row.rpm,
      vibration: null,
      power_kw: null,
      health: row.health_score,
      running_time_hrs: 0,
      downtime_hrs: 0,
    },
  };
}

export function computeMachineSummary(machines) {
  const counts = { running: 0, idle: 0, maintenance: 0, breakdown: 0, offline: 0 };
  let todaysProduction = 0;
  machines.forEach((m) => {
    const s = normalizeStatus(m);
    if (counts[s] !== undefined) counts[s] += 1;
    else counts.idle += 1;
    todaysProduction += Number(m.todays_output || 0);
  });
  const active = machines.filter((m) => normalizeStatus(m) !== "offline").length;
  const utilization = active ? Math.round((counts.running / active) * 1000) / 10 : 0;
  return {
    total_machines: machines.length,
    running: counts.running,
    idle: counts.idle,
    maintenance: counts.maintenance,
    breakdown: counts.breakdown,
    offline: counts.offline,
    utilization_pct: utilization,
    todays_production: todaysProduction,
  };
}

export function statusLabel(status) {
  const s = normalizeStatus({ status, display_status: status });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
