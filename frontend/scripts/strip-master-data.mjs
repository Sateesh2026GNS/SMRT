/**
 * Strip generated demo datasets from *MasterData.js files.
 * Keeps enums, helpers, enrichApi*, compute* functions.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data");

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".js"));

function stripFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  const before = src;

  // Remove build* generator functions (buildWo, buildDept, buildOrder, buildDemoMachine, etc.)
  src = src.replace(/const (CUSTOMERS|PRODUCTS|MACHINES|OPERATORS|MANAGERS|STATUS_POOL|STATUS_CYCLE) = \[[\s\S]*?\];\n\n/g, "");
  src = src.replace(/function build\w+\([^)]*\)\s*\{[\s\S]*?\n\}\n\n/g, "");

  // Array.from demo generators -> []
  src = src.replace(/export const (DEMO_\w+)\s*=\s*Array\.from\([^;]+\);/g, "export const $1 = [];");

  // Multi-line DEMO arrays with objects - replace with [] (summary objects keep zero structure via separate pass)
  src = src.replace(/export const (DEMO_\w+)\s*=\s*\[[\s\S]*?\];/g, (match, name) => {
    if (name.includes("SUMMARY") || name.includes("HUB") || name.includes("DASHBOARD") || name.includes("KPIS") || name.includes("DETAIL") || name.includes("GST") || name.includes("_PL")) {
      return match; // handle summaries separately
    }
    return `export const ${name} = [];`;
  });

  // Zero out numeric fields in DEMO_*_SUMMARY and hub objects
  src = src.replace(/(export const DEMO_\w+ = \{[\s\S]*?\};)/g, (block) => {
    return block
      .replace(/:\s*[\d_]+(\.[\d]+)?/g, ": 0")
      .replace(/:\s*"₹[^"]*"/g, ': "₹0"')
      .replace(/:\s*"[^"]*%"/g, ': "0%"')
      .replace(/:\s*\[[\s\S]*?\]/g, ": []");
  });

  if (src !== before) {
    fs.writeFileSync(filePath, src);
    return true;
  }
  return false;
}

let n = 0;
for (const f of files) {
  if (stripFile(path.join(dataDir, f))) {
    n++;
    console.log("stripped:", f);
  }
}

// dashboardDummyData + referenceDashboardData - zero everything
for (const name of ["dashboardDummyData.js", "referenceDashboardData.js"]) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) continue;
  let src = fs.readFileSync(p, "utf8");
  src = src.replace(/export const \w+ = \[[\s\S]*?\];/g, "export const PLACEHOLDER = [];");
  // Fix export names
  const names = [...src.matchAll(/export const (\w+)/g)].map((m) => m[1]);
  // Rewrite file cleanly
  if (name === "dashboardDummyData.js") {
    fs.writeFileSync(p, `/** Dashboard layout config — data from API only. */\n\nexport const plants = [];\nexport const kpiMetrics = [];\nexport const productionTrend = [];\nexport const oeeData = [];\nexport const machineUtilization = [];\nexport const orderStatus = [];\nexport const monthlyProduction = [];\nexport const inventoryTrend = [];\nexport const machineStatus = [];\nexport const topProducts = [];\nexport const inventorySummary = { rawMaterials: { count: 0, value: "₹0", lowStock: 0 }, wip: { count: 0, value: "₹0", lowStock: 0 }, finishedGoods: { count: 0, value: "₹0", lowStock: 0 }, stores: [] };\nexport const todaysDispatch = { total: 0, dispatched: 0, pending: 0, items: [] };\nexport const purchaseSummary = { openPOs: 0, pendingApproval: 0, receivedToday: 0, value: "₹0" };\nexport const qualityInspection = { inspected: 0, passed: 0, failed: 0, passRate: 0, pending: 0 };\nexport const lowStockAlerts = [];\nexport const criticalAlerts = [];\nexport const recentWorkOrders = [];\nexport const employeeAttendance = { present: 0, absent: 0, onLeave: 0, total: 0, shiftBreakdown: [] };\nexport const maintenanceSchedule = [];\nexport const liveProduction = { linesActive: 0, linesTotal: 0, currentOutput: 0, hourlyRate: 0, efficiency: 0 };\nexport const quickActions = [\n  { label: "New Work Order", to: "/production/work-orders/create-quick", bg: "#3B82F6" },\n  { label: "Production Entry", to: "/production/create", bg: "#22C55E" },\n  { label: "Material Issue", to: "/inventory/stock-movement", bg: "#F97316" },\n  { label: "Stock Transfer", to: "/inventory/stock-transfer", bg: "#A855F7" },\n  { label: "QC Entry", to: "/quality/inspection", bg: "#0EA5E9" },\n  { label: "Reports", to: "/analytics/production", bg: "#6366F1" },\n];\nexport const todaysSummary = { manpower: 0, workingHours: "0 Hrs", powerConsumption: "0 kWh", targetAchievement: "0%" };\n`);
  } else {
    fs.writeFileSync(p, `/** Reference dashboard layout — data from API only. */\n\nexport const plants = [];\nexport const kpiCards = [];\nexport const productionOverview = [];\nexport const productionOverviewWeekly = [];\nexport const productionOverviewMonthly = [];\nexport const shopFloorStatus = [];\nexport const topMachines = [];\nexport const ordersOverview = { total: 0, inProgress: 0, completed: 0, onHold: 0, progress: 0 };\nexport const inventoryBlocks = [];\nexport const warehouseLocations = [];\nexport const alertsFeed = [];\nexport const quickActionsRef = [\n  { label: "New Work Order", to: "/production/work-orders/create-quick", bg: "#3B82F6" },\n  { label: "Production Entry", to: "/production/create", bg: "#22C55E" },\n  { label: "Material Issue", to: "/inventory/stock-movement", bg: "#F97316" },\n  { label: "Stock Transfer", to: "/inventory/stock-transfer", bg: "#A855F7" },\n  { label: "QC Entry", to: "/quality/inspection", bg: "#0EA5E9" },\n  { label: "Reports", to: "/analytics/production", bg: "#6366F1" },\n];\nexport const recentWorkOrdersRef = [];\nexport const todaysSummaryRef = [];\n`);
  }
  console.log("rewrote:", name);
  n++;
}

console.log(`Done. ${n} data files processed.`);
