/** Analytics demo data and helpers. */

export const FISCAL_YEARS = ["2025-26", "2024-25", "2023-24"];
export const QUARTERS = ["All Quarters", "Q1 (Apr-Jun)", "Q2 (Jul-Sep)", "Q3 (Oct-Dec)", "Q4 (Jan-Mar)"];
export const MONTHS = ["All Months", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
export const PLANTS = ["All Plants", "Plant-1", "Plant-2", "Head Office"];
export const DEPARTMENTS = ["All Departments", "Production", "Quality", "Maintenance", "Sales", "Finance", "HR", "Warehouse"];
export const WAREHOUSES = ["All Warehouses", "RM Store", "FG Warehouse", "Spares", "WIP Bay"];
export const PRODUCTS = ["All Products", "Gear Assembly", "Shaft Unit", "Housing", "Bracket"];
export const CUSTOMERS = ["All Customers", "Mehta Industries", "Nair Pharma", "Singh Auto Parts", "Rao Electronics"];
export const MACHINES = ["All Machines", "CNC-01", "PR-03", "LT-02", "ML-04"];

export const CHART_COLORS = ["#2563EB", "#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export function formatInr(v) {
  if (v == null) return "₹0";
  const n = Number(v);
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatKpiValue(kpi) {
  if (!kpi) return "—";
  const v = kpi.value;
  if (kpi.format === "currency") return formatInr(v);
  if (kpi.format === "percent") return `${v}${kpi.unit || "%"}`;
  return `${Number(v).toLocaleString("en-IN")}${kpi.unit ? ` ${kpi.unit}` : ""}`;
}

export function changeColor(pct) {
  if (pct == null) return "text-slate-400";
  if (pct > 0) return "text-emerald-600";
  if (pct < 0) return "text-red-600";
  return "text-slate-500";
}

export function changeArrow(pct) {
  if (pct == null) return "";
  if (pct > 0) return "▲";
  if (pct < 0) return "▼";
  return "—";
}

export function alertSeverityClass(severity) {
  const m = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };
  return m[severity] || m.info;
}

export function exportCsv(filename, rows, headers) {
  const lines = [headers.join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => r[h] ?? "").join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.csv`;
  a.click();
}

export function exportChartPng(chartId, filename) {
  const svg = document.querySelector(`#${chartId} svg`);
  if (!svg) { window.print(); return; }
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new window.Image();
  img.onload = () => {
    canvas.width = img.width || 800;
    canvas.height = img.height || 400;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${filename || "chart"}.png`;
    a.click();
  };
  img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
}

export const DEMO_PRODUCTION = {
  kpis: [
    { key: "planned", label: "Planned Production", value: 48500, change_pct: 5.2, unit: "units", format: "number", drill_target: "monthly" },
    { key: "actual", label: "Actual Production", value: 44820, change_pct: -2.1, unit: "units", format: "number", drill_target: "monthly" },
    { key: "efficiency", label: "Production Efficiency", value: 92.4, change_pct: 1.8, unit: "%", format: "percent", drill_target: "machine" },
    { key: "oee", label: "OEE", value: 78.5, change_pct: -1.2, unit: "%", format: "percent", drill_target: "machine" },
    { key: "utilization", label: "Machine Utilization", value: 75.0, change_pct: 3.5, unit: "%", format: "percent", drill_target: "machine" },
    { key: "rejection", label: "Rejection %", value: 3.2, change_pct: -0.8, unit: "%", format: "percent", drill_target: "quality" },
    { key: "downtime", label: "Downtime Hours", value: 48.5, change_pct: 12.0, unit: "h", format: "number", drill_target: "downtime" },
    { key: "cost", label: "Production Cost", value: 2850000, change_pct: 4.2, format: "currency", drill_target: "cost" },
    { key: "wip", label: "WIP", value: 1250, change_pct: -3.0, unit: "units", format: "number", drill_target: "wip" },
    { key: "completed", label: "Completed Orders", value: 86, change_pct: 8.5, format: "number", drill_target: "orders" },
    { key: "worker", label: "Worker Performance", value: 88.5, change_pct: 2.4, unit: "%", format: "percent", drill_target: "operator" },
    { key: "avg_month", label: "Avg / Month", value: 3735, change_pct: 1.2, unit: "units", format: "number", drill_target: "monthly" },
  ],
  alerts: [
    { type: "target", severity: "warning", message: "Production target at 92% — 8% below plan", benchmark: "Target 100%" },
    { type: "downtime", severity: "danger", message: "Machine downtime increased 12% this week" },
    { type: "rejection", severity: "warning", message: "High rejection rate on Line-2 — 5.8%" },
    { type: "achievement", severity: "success", message: "Shift A exceeded daily target by 6%" },
  ],
  benchmarks: [
    { label: "Target Production", target: 100, current: 92, industry: 95 },
    { label: "OEE", target: 85, current: 78.5, industry: 82 },
    { label: "Machine Utilization", target: 90, current: 75, industry: 88 },
  ],
  monthly_production: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ label: m, value: 3200 + i * 180, value2: 3500 + i * 200 })),
  production_trend: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ label: m, value: 3200 + i * 180, value2: 3500 + i * 200 })),
  daily_output: Array.from({ length: 30 }, (_, i) => ({ label: `Day ${i + 1}`, value: 140 + (i % 5) * 12 })),
  shift_wise: [{ label: "Morning", value: 1850 }, { label: "Afternoon", value: 1620 }, { label: "Night", value: 1280 }],
  machine_wise: [{ label: "CNC-01", value: 88 }, { label: "PR-03", value: 72 }, { label: "LT-02", value: 85 }, { label: "ML-04", value: 91 }],
  product_wise: [{ label: "Gear Assembly", value: 4200 }, { label: "Shaft Unit", value: 3800 }, { label: "Housing", value: 2900 }, { label: "Bracket", value: 2100 }],
  operator_performance: [{ label: "Ravi Kumar", value: 94 }, { label: "Suresh Reddy", value: 91 }, { label: "Mahesh Patel", value: 88 }],
  downtime_analysis: [{ label: "Breakdown", value: 18 }, { label: "Setup", value: 12 }, { label: "Material Wait", value: 8 }, { label: "Planned PM", value: 6 }],
  worker_score: 88.5,
  last_updated: new Date().toISOString(),
};

export const DEMO_INVENTORY = {
  kpis: [
    { key: "turnover", label: "Turnover Rate", value: 6.2, change_pct: 0.8, unit: "x", format: "number" },
    { key: "outflow", label: "Outflow", value: 18500, change_pct: 5.4, unit: "units", format: "number" },
    { key: "avg_inv", label: "Average Inventory", value: 4200, change_pct: -2.1, unit: "units", format: "number" },
    { key: "value", label: "Inventory Value", value: 12500000, change_pct: 3.2, format: "currency" },
    { key: "fast", label: "Fast Moving Items", value: 42, change_pct: 6.0, format: "number" },
    { key: "slow", label: "Slow Moving Items", value: 18, change_pct: -4.0, format: "number" },
    { key: "dead", label: "Dead Stock", value: 7, change_pct: -12.0, format: "number" },
    { key: "reorder", label: "Reorder Alerts", value: 12, change_pct: 15.0, format: "number" },
    { key: "accuracy", label: "Stock Accuracy", value: 96.8, change_pct: 0.5, unit: "%", format: "percent" },
    { key: "warehouse", label: "Warehouse Utilization", value: 78.5, change_pct: 2.1, unit: "%", format: "percent" },
  ],
  alerts: [
    { type: "reorder", severity: "danger", message: "12 items below reorder level" },
    { type: "dead", severity: "warning", message: "7 dead stock items — ₹2.4L tied up" },
  ],
  stock_in_vs_out: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ label: m, value: 1200 + i * 80, value2: 980 + i * 70 })),
  warehouse_occupancy: [{ label: "RM Store", value: 82 }, { label: "FG Warehouse", value: 75 }, { label: "Spares", value: 68 }, { label: "WIP Bay", value: 91 }],
  abc_analysis: [{ label: "A Items", value: 72 }, { label: "B Items", value: 22 }, { label: "C Items", value: 6 }],
  inventory_aging: [{ label: "0-30 Days", value: 45 }, { label: "31-60 Days", value: 28 }, { label: "61-90 Days", value: 18 }, { label: "90+ Days", value: 9 }],
  monthly_consumption: ["Apr","May","Jun","Jul","Aug","Sep"].map((m, i) => ({ label: m, value: 850 + i * 45 })),
  value_trend: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ label: m, value: 11000000 + i * 250000 })),
  fast_moving: [{ item: "Steel Rod 12mm", qty: 2400, turns: 8.2 }],
  slow_moving: [{ item: "Legacy Gasket Set", qty: 120, days_idle: 145 }],
  dead_stock: [{ item: "Obsolete Motor", qty: 4, value: 68000 }],
  reorder_alerts: [{ item: "Hydraulic Oil", current: 45, reorder: 100, warehouse: "RM Store" }],
  last_updated: new Date().toISOString(),
};

export const DEMO_SALES = {
  kpis: [
    { key: "revenue", label: "Revenue", value: 8500000, change_pct: 12.8, format: "currency", drill_target: "month" },
    { key: "orders", label: "Orders", value: 120, change_pct: 8.2, format: "number", drill_target: "orders" },
    { key: "customers", label: "Customers", value: 18, change_pct: 5.0, format: "number", drill_target: "customer" },
    { key: "conversion", label: "Conversion Rate", value: 15.4, change_pct: 1.2, unit: "%", format: "percent", drill_target: "funnel" },
    { key: "aov", label: "Average Order Value", value: 70833, change_pct: 3.8, format: "currency", drill_target: "orders" },
    { key: "growth", label: "Sales Growth", value: 12.8, change_pct: 2.4, unit: "%", format: "percent", drill_target: "month" },
    { key: "pending", label: "Pending Orders", value: 18, change_pct: -6.0, format: "number", drill_target: "orders" },
    { key: "dispatch", label: "Dispatch Performance", value: 88.5, change_pct: 4.5, unit: "%", format: "percent", drill_target: "dispatch" },
  ],
  alerts: [
    { type: "revenue", severity: "warning", message: "Revenue down 12% vs last month in East region" },
    { type: "dispatch", severity: "info", message: "12 orders ready for dispatch" },
  ],
  monthly_revenue: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ label: m, value: 650000 + i * 180000 })),
  top_customers: [{ label: "Mehta Industries", value: 1250000 }, { label: "Nair Pharma", value: 980000 }, { label: "Singh Auto", value: 820000 }],
  top_products: [{ label: "Gear Assembly", value: 1850000 }, { label: "Shaft Unit", value: 1420000 }],
  regional_sales: [{ label: "West", value: 32 }, { label: "South", value: 28 }, { label: "North", value: 22 }],
  sales_funnel: [{ label: "Leads", value: 156 }, { label: "Qualified", value: 38 }, { label: "Orders", value: 120 }],
  quotation_conversion: ["Apr","May","Jun","Jul","Aug","Sep"].map((m, i) => ({ label: m, value: 12 + i * 1.5 })),
  order_status: [{ label: "Pending", value: 18 }, { label: "Confirmed", value: 45 }, { label: "Shipped", value: 18 }],
  drill_revenue: [
    { level: "year", label: "2026", value: 8500000 },
    { level: "month", label: "July", value: 850000 },
    { level: "customer", label: "Mehta Industries", value: 425000 },
    { level: "invoice", label: "INV-2026-0095", value: 212400 },
  ],
  last_updated: new Date().toISOString(),
};

export const DEMO_FINANCE = {
  kpis: [
    { key: "revenue", label: "Revenue", value: 4500000, change_pct: 8.5, format: "currency", drill_target: "month" },
    { key: "expenses", label: "Expenses", value: 3200000, change_pct: 4.2, format: "currency", drill_target: "expense" },
    { key: "profit", label: "Net Profit", value: 1300000, change_pct: 12.0, format: "currency", drill_target: "profit" },
    { key: "margin", label: "Margin", value: 28.9, change_pct: 1.8, unit: "%", format: "percent", drill_target: "margin" },
    { key: "cashflow", label: "Cash Flow", value: 950000, change_pct: -5.2, format: "currency", drill_target: "cashflow" },
    { key: "receivables", label: "Outstanding Receivables", value: 1250000, change_pct: 3.0, format: "currency", drill_target: "receivables" },
    { key: "payables", label: "Outstanding Payables", value: 850000, change_pct: -2.0, format: "currency", drill_target: "payables" },
    { key: "gst", label: "GST Collected", value: 485000, change_pct: 6.5, format: "currency", drill_target: "gst" },
    { key: "operating", label: "Operating Cost", value: 1850000, change_pct: 2.8, format: "currency", drill_target: "expense" },
    { key: "monthly_profit", label: "Monthly Profit", value: 108333, change_pct: 4.0, format: "currency", drill_target: "profit" },
    { key: "ebitda", label: "EBITDA", value: 1540000, change_pct: 7.2, format: "currency", drill_target: "profit" },
    { key: "working_capital", label: "Working Capital", value: 1650000, change_pct: 1.5, format: "currency", drill_target: "capital" },
  ],
  alerts: [
    { type: "revenue", severity: "warning", message: "Revenue down 12% vs last quarter" },
    { type: "cashflow", severity: "danger", message: "Cash flow risk detected — payables due this week" },
  ],
  revenue_vs_expense: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({ label: m, value: 3500000 + i * 80000, value2: 2500000 + i * 60000 })),
  cash_flow: ["Apr","May","Jun","Jul","Aug","Sep"].map((m, i) => ({ label: m, value: 3800000 + i * 200000, value2: 2800000 + i * 150000 })),
  profit_trend: ["Jan","Feb","Mar","Apr","May","Jun"].map((m, i) => ({ label: m, value: 900000 + i * 50000 })),
  expense_category: [{ label: "Raw Materials", value: 42 }, { label: "Labour", value: 28 }, { label: "Overheads", value: 15 }],
  receivable_aging: [{ label: "0-30 Days", value: 580000 }, { label: "31-60 Days", value: 320000 }, { label: "90+ Days", value: 140000 }],
  monthly_margin: ["Jan","Feb","Mar","Apr","May","Jun"].map((m, i) => ({ label: m, value: 26 + i * 0.5 })),
  drill_revenue: [
    { level: "year", label: "2026", value: 4500000 },
    { level: "month", label: "July", value: 3800000 },
    { level: "category", label: "Sales Revenue", value: 2800000 },
    { level: "invoice", label: "INV-2026-0095", value: 212400 },
  ],
  last_updated: new Date().toISOString(),
};

export const DEMO_EXECUTIVE = {
  kpis: [
    { key: "revenue", label: "Revenue", value: 8500000, change_pct: 12.8, format: "currency" },
    { key: "profit", label: "Profit", value: 1300000, change_pct: 12.0, format: "currency" },
    { key: "production", label: "Production", value: 44820, change_pct: -2.1, unit: "units", format: "number" },
    { key: "inventory", label: "Inventory", value: 12500000, change_pct: 3.2, format: "currency" },
    { key: "machine_health", label: "Machine Health", value: 87.5, change_pct: 2.4, unit: "%", format: "percent" },
    { key: "worker_eff", label: "Worker Efficiency", value: 88.5, change_pct: 2.4, unit: "%", format: "percent" },
    { key: "satisfaction", label: "Customer Satisfaction", value: 4.6, change_pct: 0.3, unit: "/5", format: "number" },
    { key: "pending_orders", label: "Pending Orders", value: 18, change_pct: -6.0, format: "number" },
    { key: "quality", label: "Quality Pass Rate", value: 94.5, change_pct: 0.8, unit: "%", format: "percent" },
  ],
  alerts: DEMO_PRODUCTION.alerts.slice(0, 4),
  benchmarks: DEMO_PRODUCTION.benchmarks,
  revenue_trend: DEMO_SALES.monthly_revenue,
  production_trend: DEMO_PRODUCTION.production_trend,
  inventory_value_trend: DEMO_INVENTORY.value_trend,
  machine_health: DEMO_PRODUCTION.machine_wise,
  quality_pass_rate: 94.5,
  ai_insights: [
    { type: "production", message: "Production will miss target by 8%", confidence: 0.82 },
    { type: "inventory", message: "Inventory of Item A will finish in 3 days", confidence: 0.91 },
    { type: "maintenance", message: "Machine M2 likely needs maintenance", confidence: 0.76 },
    { type: "sales", message: "Sales likely to increase next month", confidence: 0.68 },
    { type: "finance", message: "Cash flow risk detected", confidence: 0.85 },
  ],
  last_updated: new Date().toISOString(),
};

export const DEMO_LIVE = {
  current_production: 1850,
  active_machines: 18,
  total_machines: 24,
  todays_orders: 12,
  dispatches_today: 8,
  breakdown_alerts: 1,
  live_oee: 78.5,
  alerts: [
    { type: "breakdown", severity: "danger", message: "Hydraulic Press — breakdown in progress" },
    { type: "dispatch", severity: "info", message: "8 dispatches scheduled today" },
    { type: "target", severity: "success", message: "Morning shift at 104% of target" },
  ],
  ai_insights: [
    { type: "production", message: "Line-2 output trending 6% above average", confidence: 0.88 },
    { type: "maintenance", message: "CNC-01 vibration anomaly detected", confidence: 0.72 },
  ],
  production_pulse: Array.from({ length: 12 }, (_, i) => ({ label: `${6 + i}:00`, value: 120 + (i % 4) * 15 })),
  last_updated: new Date().toISOString(),
};

export const SOURCE_LINKS = {
  production: "/production",
  inventory: "/inventory",
  sales: "/sales",
  finance: "/accounts",
  quality: "/quality",
};
