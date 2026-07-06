/** Reference dashboard data — matches SMRT ERP admin screenshot */

export const plants = [
  { id: "plant-1", name: "Hyderabad Plant – Unit A" },
  { id: "plant-2", name: "Chennai Plant – Unit B" },
];

export const kpiCards = [
  {
    id: "total-orders",
    title: "Total Orders",
    value: "1,248",
    trend: "18.6%",
    trendUp: true,
    trendLabel: "vs last 7 days",
    gradient: "from-[#3B82F6] to-[#2563EB]",
    iconBg: "bg-white/20",
  },
  {
    id: "today-production",
    title: "Today's Production",
    value: "2,450",
    unit: "Pcs",
    trend: "15.2%",
    trendUp: true,
    trendLabel: "vs yesterday",
    gradient: "from-[#22C55E] to-[#16A34A]",
    iconBg: "bg-white/20",
  },
  {
    id: "machines-running",
    title: "Machines Running",
    value: "24",
    suffix: "/ 40",
    trend: "60%",
    trendUp: true,
    trendLabel: "vs total machines",
    gradient: "from-[#A855F7] to-[#7C3AED]",
    iconBg: "bg-white/20",
  },
  {
    id: "pending-orders",
    title: "Pending Orders",
    value: "218",
    trend: "6.3%",
    trendUp: false,
    trendLabel: "vs last 7 days",
    gradient: "from-[#F97316] to-[#EA580C]",
    iconBg: "bg-white/20",
  },
  {
    id: "good-qty",
    title: "Good Qty (Today)",
    value: "1,985",
    unit: "Pcs",
    trend: "17.8%",
    trendUp: true,
    trendLabel: "vs yesterday",
    gradient: "from-[#14B8A6] to-[#0D9488]",
    iconBg: "bg-white/20",
  },
  {
    id: "reject-qty",
    title: "Reject Qty (Today)",
    value: "145",
    unit: "Pcs",
    trend: "2.1%",
    trendUp: false,
    trendLabel: "vs yesterday",
    gradient: "from-[#EF4444] to-[#DC2626]",
    iconBg: "bg-white/20",
  },
];

export const productionOverview = [
  { date: "07 Jun", planned: 2100, actual: 1980 },
  { date: "08 Jun", planned: 2200, actual: 2150 },
  { date: "09 Jun", planned: 2300, actual: 2280 },
  { date: "10 Jun", planned: 2250, actual: 2200 },
  { date: "11 Jun", planned: 2400, actual: 2350 },
  { date: "12 Jun", planned: 2350, actual: 2300 },
  { date: "13 Jun", planned: 2450, actual: 2450 },
];

export const shopFloorStatus = [
  { name: "Running", value: 24, color: "#22C55E" },
  { name: "Idle", value: 8, color: "#3B82F6" },
  { name: "Setup", value: 4, color: "#F97316" },
  { name: "Maintenance", value: 2, color: "#EF4444" },
  { name: "Breakdown", value: 2, color: "#991B1B" },
];

export const topMachines = [
  { id: "CNC-01", name: "CNC Milling Unit", utilization: 85 },
  { id: "VMC-01", name: "VMC Center", utilization: 72 },
  { id: "LATHE-01", name: "CNC Lathe", utilization: 68 },
  { id: "PRESS-01", name: "Hydraulic Press", utilization: 55 },
  { id: "WELD-01", name: "Robotic Welding", utilization: 48 },
];

export const ordersOverview = {
  total: 1248,
  inProgress: 615,
  completed: 433,
  onHold: 200,
  progress: 65,
};

export const inventoryBlocks = [
  { label: "Raw Materials", count: 1562, icon: "boxes", color: "#3B82F6" },
  { label: "WIP Items", count: 320, icon: "cog", color: "#F97316" },
  { label: "Finished Goods", count: 845, icon: "package", color: "#22C55E" },
  { label: "Low Stock Items", count: 32, icon: "alert", color: "#EF4444" },
];

export const warehouseLocations = [
  { name: "Main Store", pct: 38, color: "#3B82F6" },
  { name: "Production Store", pct: 28, color: "#22C55E" },
  { name: "FG Store", pct: 24, color: "#A855F7" },
  { name: "Others", pct: 10, color: "#94A3B8" },
];

export const alertsFeed = [
  { id: 1, message: "Work Order WO-1025 is delayed", time: "10 min ago", color: "#EF4444", icon: "alert" },
  { id: 2, message: "Machine CNC-03 requires maintenance", time: "25 min ago", color: "#F97316", icon: "wrench" },
  { id: 3, message: "Low stock alert: SS Sheet 304", time: "1 hr ago", color: "#3B82F6", icon: "box" },
  { id: 4, message: "Quality inspection passed for Batch B-882", time: "2 hrs ago", color: "#22C55E", icon: "check" },
  { id: 5, message: "Purchase Order PO-445 awaiting approval", time: "3 hrs ago", color: "#A855F7", icon: "cart" },
];

export const quickActionsRef = [
  { label: "New Work Order", to: "/production/work-orders/create-quick", bg: "#3B82F6" },
  { label: "Production Entry", to: "/production/create", bg: "#22C55E" },
  { label: "Material Issue", to: "/inventory/stock-movement", bg: "#F97316" },
  { label: "Stock Transfer", to: "/inventory/stock-transfer", bg: "#A855F7" },
  { label: "QC Entry", to: "/quality/inspection", bg: "#0EA5E9" },
  { label: "Reports", to: "/analytics/production", bg: "#6366F1" },
];

export const recentWorkOrdersRef = [
  { wo: "WO-1025", product: "Precision Gear Assembly", qty: 500, status: "in_progress", due: "04 Jul 2026" },
  { wo: "WO-1024", product: "Hydraulic Valve Block", qty: 320, status: "completed", due: "03 Jul 2026" },
  { wo: "WO-1023", product: "Motor Housing Casting", qty: 280, status: "planned", due: "05 Jul 2026" },
  { wo: "WO-1022", product: "Control Panel Enclosure", qty: 150, status: "on_hold", due: "06 Jul 2026" },
  { wo: "WO-1021", product: "Bearing Retainer Ring", qty: 600, status: "in_progress", due: "04 Jul 2026" },
];

export const todaysSummaryRef = [
  { label: "Man Power", value: "156", icon: "users" },
  { label: "Working Hours", value: "1,248 Hrs", icon: "clock" },
  { label: "Power Consumption", value: "1,680 kWh", icon: "zap" },
  { label: "Production Efficiency", value: "87.6%", icon: "gauge" },
  { label: "Target Achievement", value: "92.4%", icon: "target" },
];
