/** Dummy JSON data for the SMRT Enterprise Admin Dashboard */

export const plants = [
  { id: "plant-1", name: "Hyderabad Plant – Unit A" },
  { id: "plant-2", name: "Chennai Plant – Unit B" },
  { id: "plant-3", name: "Pune Assembly – Unit C" },
];

export const kpiMetrics = [
  {
    id: "total-orders",
    title: "Total Orders",
    value: "1,284",
    trend: "+12.4%",
    trendUp: true,
    subtitle: "vs last 30 days",
    icon: "ShoppingCart",
    accent: "#2563EB",
    bg: "from-blue-500/10 to-blue-600/5",
  },
  {
    id: "today-production",
    title: "Today's Production",
    value: "2,640",
    unit: "Pcs",
    trend: "+8.2%",
    trendUp: true,
    subtitle: "vs yesterday",
    icon: "PrecisionManufacturing",
    accent: "#22C55E",
    bg: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    id: "machines-running",
    title: "Machines Running",
    value: "26",
    suffix: "/ 42",
    trend: "62%",
    trendUp: true,
    subtitle: "shop floor utilization",
    icon: "Settings",
    accent: "#8B5CF6",
    bg: "from-violet-500/10 to-violet-600/5",
  },
  {
    id: "production-efficiency",
    title: "Production Efficiency",
    value: "91.8",
    unit: "%",
    trend: "+2.1%",
    trendUp: true,
    subtitle: "OEE weighted avg",
    icon: "Speed",
    accent: "#0EA5E9",
    bg: "from-sky-500/10 to-sky-600/5",
  },
  {
    id: "pending-orders",
    title: "Pending Orders",
    value: "186",
    trend: "-4.6%",
    trendUp: false,
    subtitle: "awaiting dispatch",
    icon: "PendingActions",
    accent: "#F59E0B",
    bg: "from-amber-500/10 to-amber-600/5",
  },
  {
    id: "good-qty",
    title: "Good Quantity",
    value: "2,498",
    unit: "Pcs",
    trend: "+6.8%",
    trendUp: true,
    subtitle: "first pass yield",
    icon: "Verified",
    accent: "#14B8A6",
    bg: "from-teal-500/10 to-teal-600/5",
  },
  {
    id: "rejected-qty",
    title: "Rejected Quantity",
    value: "142",
    unit: "Pcs",
    trend: "-1.9%",
    trendUp: true,
    subtitle: "quality rejects today",
    icon: "Cancel",
    accent: "#EF4444",
    bg: "from-red-500/10 to-red-600/5",
  },
  {
    id: "revenue-today",
    title: "Revenue Today",
    value: "₹18.6L",
    trend: "+15.3%",
    trendUp: true,
    subtitle: "invoiced & settled",
    icon: "CurrencyRupee",
    accent: "#0F172A",
    bg: "from-slate-500/10 to-slate-600/5",
  },
];

export const productionTrend = [
  { day: "Mon", planned: 2200, actual: 2100, target: 2300 },
  { day: "Tue", planned: 2400, actual: 2350, target: 2400 },
  { day: "Wed", planned: 2300, actual: 2280, target: 2350 },
  { day: "Thu", planned: 2500, actual: 2480, target: 2500 },
  { day: "Fri", planned: 2600, actual: 2640, target: 2600 },
  { day: "Sat", planned: 1800, actual: 1720, target: 1900 },
  { day: "Sun", planned: 1200, actual: 980, target: 1300 },
];

export const oeeData = [
  { name: "Availability", value: 88, fill: "#2563EB" },
  { name: "Performance", value: 92, fill: "#22C55E" },
  { name: "Quality", value: 96, fill: "#8B5CF6" },
];

export const machineUtilization = [
  { machine: "CNC-01", utilization: 92 },
  { machine: "VMC-02", utilization: 87 },
  { machine: "LATHE-03", utilization: 78 },
  { machine: "PRESS-04", utilization: 71 },
  { machine: "WELD-05", utilization: 65 },
  { machine: "ASSY-06", utilization: 58 },
];

export const orderStatus = [
  { name: "In Progress", value: 42, color: "#2563EB" },
  { name: "Completed", value: 28, color: "#22C55E" },
  { name: "Planned", value: 18, color: "#94A3B8" },
  { name: "On Hold", value: 8, color: "#F59E0B" },
  { name: "Delayed", value: 4, color: "#EF4444" },
];

export const monthlyProduction = [
  { month: "Jan", output: 42000, target: 45000 },
  { month: "Feb", output: 44500, target: 45000 },
  { month: "Mar", output: 46800, target: 46000 },
  { month: "Apr", output: 45200, target: 47000 },
  { month: "May", output: 48100, target: 48000 },
  { month: "Jun", output: 49600, target: 50000 },
];

export const inventoryTrend = [
  { week: "W1", raw: 420, wip: 180, fg: 320 },
  { week: "W2", raw: 398, wip: 195, fg: 340 },
  { week: "W3", raw: 410, wip: 172, fg: 355 },
  { week: "W4", raw: 385, wip: 188, fg: 368 },
];

export const machineStatus = [
  { id: "CNC-01", name: "CNC Milling – Line 1", status: "running", utilization: 92 },
  { id: "VMC-02", name: "VMC Center – Line 2", status: "running", utilization: 87 },
  { id: "LATHE-03", name: "CNC Lathe – Line 3", status: "idle", utilization: 0 },
  { id: "PRESS-04", name: "Hydraulic Press", status: "setup", utilization: 45 },
  { id: "WELD-05", name: "Robotic Welding Cell", status: "running", utilization: 78 },
  { id: "ASSY-06", name: "Assembly Station", status: "maintenance", utilization: 0 },
];

export const topProducts = [
  { rank: 1, name: "Precision Gear Assembly", sku: "PGA-4401", qty: 840, revenue: "₹4.2L" },
  { rank: 2, name: "Hydraulic Valve Block", sku: "HVB-2208", qty: 620, revenue: "₹3.1L" },
  { rank: 3, name: "Motor Housing Casting", sku: "MHC-1180", qty: 510, revenue: "₹2.4L" },
  { rank: 4, name: "Control Panel Enclosure", sku: "CPE-3302", qty: 380, revenue: "₹1.8L" },
  { rank: 5, name: "Bearing Retainer Ring", sku: "BRR-9901", qty: 290, revenue: "₹0.9L" },
];

export const inventorySummary = {
  rawMaterials: { count: 248, value: "₹42.6L", lowStock: 12 },
  wip: { count: 86, value: "₹18.2L", lowStock: 3 },
  finishedGoods: { count: 164, value: "₹68.4L", lowStock: 5 },
  stores: [
    { name: "Main Store", pct: 38, color: "#2563EB" },
    { name: "Production Store", pct: 28, color: "#22C55E" },
    { name: "FG Warehouse", pct: 24, color: "#8B5CF6" },
    { name: "Others", pct: 10, color: "#94A3B8" },
  ],
};

export const todaysDispatch = {
  total: 24,
  dispatched: 18,
  pending: 6,
  items: [
    { id: "DSP-1042", customer: "Tata AutoComp", qty: 420, status: "dispatched" },
    { id: "DSP-1043", customer: "Bosch India", qty: 280, status: "dispatched" },
    { id: "DSP-1044", customer: "Mahindra Parts", qty: 150, status: "pending" },
  ],
};

export const purchaseSummary = {
  openPOs: 34,
  pendingApproval: 8,
  receivedToday: 12,
  value: "₹24.8L",
};

export const qualityInspection = {
  inspected: 186,
  passed: 172,
  failed: 14,
  passRate: 92.5,
  pending: 22,
};

export const lowStockAlerts = [
  { item: "SS Sheet 304 – 2mm", sku: "RM-SS304-2", qty: 42, reorder: 100, severity: "critical" },
  { item: "Hydraulic Oil ISO 46", sku: "RM-HO-046", qty: 18, reorder: 50, severity: "warning" },
  { item: "M8 Hex Bolt Grade 8.8", sku: "RM-BLT-M8", qty: 320, reorder: 500, severity: "warning" },
];

export const criticalAlerts = [
  { id: 1, type: "delay", message: "Work Order WO-2048 is 6 hrs behind schedule", time: "12 min ago", severity: "high" },
  { id: 2, type: "machine", message: "ASSY-06 entered maintenance mode unexpectedly", time: "28 min ago", severity: "high" },
  { id: 3, type: "quality", message: "Batch B-8821 failed dimensional inspection", time: "1 hr ago", severity: "medium" },
  { id: 4, type: "inventory", message: "SS Sheet 304 below minimum stock level", time: "2 hrs ago", severity: "medium" },
];

export const recentWorkOrders = [
  { wo: "WO-2048", product: "Precision Gear Assembly", qty: 500, status: "in_progress", due: "04 Jul 2026" },
  { wo: "WO-2047", product: "Hydraulic Valve Block", qty: 320, status: "completed", due: "03 Jul 2026" },
  { wo: "WO-2046", product: "Motor Housing Casting", qty: 280, status: "planned", due: "05 Jul 2026" },
  { wo: "WO-2045", product: "Control Panel Enclosure", qty: 150, status: "on_hold", due: "06 Jul 2026" },
  { wo: "WO-2044", product: "Bearing Retainer Ring", qty: 600, status: "in_progress", due: "04 Jul 2026" },
];

export const employeeAttendance = {
  present: 142,
  absent: 8,
  onLeave: 6,
  total: 156,
  shiftBreakdown: [
    { shift: "Morning", present: 78, total: 82 },
    { shift: "Evening", present: 64, total: 74 },
  ],
};

export const maintenanceSchedule = [
  { machine: "CNC-01", type: "Preventive", date: "05 Jul 2026", status: "scheduled" },
  { machine: "PRESS-04", type: "Calibration", date: "06 Jul 2026", status: "scheduled" },
  { machine: "WELD-05", type: "Breakdown", date: "04 Jul 2026", status: "in_progress" },
];

export const liveProduction = {
  linesActive: 8,
  linesTotal: 10,
  currentOutput: 2640,
  hourlyRate: 220,
  efficiency: 91.8,
};

export const quickActions = [
  { label: "Create Work Order", icon: "Assignment", to: "/production/work-orders/create-quick", color: "#2563EB" },
  { label: "Material Issue", icon: "Inventory", to: "/inventory/stock-movement", color: "#22C55E" },
  { label: "Production Entry", icon: "Factory", to: "/production/create", color: "#8B5CF6" },
  { label: "QC Entry", icon: "FactCheck", to: "/quality/inspection", color: "#0EA5E9" },
  { label: "Purchase Order", icon: "ShoppingCart", to: "/procurement/purchase-orders/create", color: "#F59E0B" },
  { label: "Sales Order", icon: "Receipt", to: "/sales/orders/create", color: "#EC4899" },
  { label: "Reports", icon: "Assessment", to: "/analytics/production", color: "#6366F1" },
  { label: "Settings", icon: "Settings", to: "/settings", color: "#64748B" },
];

export const todaysSummary = {
  manpower: 156,
  workingHours: "1,248 Hrs",
  powerConsumption: "1,720 kWh",
  targetAchievement: "94.2%",
};
