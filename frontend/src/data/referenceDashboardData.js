/** Reference dashboard layout — data from API only. */

export const plants = [];
export const kpiCards = [];
export const productionOverview = [];
export const productionOverviewWeekly = [];
export const productionOverviewMonthly = [];
export const shopFloorStatus = [];
export const topMachines = [];
export const ordersOverview = { total: 0, inProgress: 0, completed: 0, onHold: 0, progress: 0 };
export const inventoryBlocks = [];
export const warehouseLocations = [];
export const alertsFeed = [];
export const quickActionsRef = [
  { label: "New Work Order", to: "/production/work-orders/create-quick", bg: "#3B82F6" },
  { label: "Production Entry", to: "/production/create", bg: "#22C55E" },
  { label: "Material Issue", to: "/inventory/stock-movement", bg: "#F97316" },
  { label: "Stock Transfer", to: "/inventory/stock-transfer", bg: "#A855F7" },
  { label: "QC Entry", to: "/quality/inspection", bg: "#0EA5E9" },
  { label: "Reports", to: "/analytics/production", bg: "#6366F1" },
];
export const recentWorkOrdersRef = [];
export const todaysSummaryRef = [];
