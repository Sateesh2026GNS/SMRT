import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock,
  FileText,
  Gauge,
  Package,
  Plus,
  ShoppingCart,
  Target,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import {
  alertsFeed,
  inventoryBlocks,
  kpiCards,
  ordersOverview,
  productionOverview,
  productionOverviewWeekly,
  productionOverviewMonthly,
  productionOverviewYearly,
  quickActionsRef,
  recentWorkOrdersRef,
  shopFloorStatus,
  todaysSummaryRef,
  topMachines,
  warehouseLocations,
} from "../../../data/referenceDashboardData";
import { getErpDashboard } from "../../../api/dashboardApi";
import Loader from "../../common/Loader";
import useAuth from "../../../hooks/useAuth";
import { userCanAccess } from "../../../config/permissions";
import {
  CardShell,
  KpiIcon,
  StatusBadge,
  TrendBadge,
} from "./ReferenceParts";

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  fontSize: 12,
};

const KPI_TITLE_KEYS = {
  "total-orders": "totalOrders",
  "today-production": "todaysProduction",
  "machines-running": "machinesRunning",
  "pending-orders": "pendingOrders",
  "good-qty": "goodQtyToday",
  "reject-qty": "rejectQtyToday",
};

const KPI_MODULES = {
  "total-orders": "production",
  "today-production": "production",
  "machines-running": "production",
  "pending-orders": "production",
  "good-qty": "quality",
  "reject-qty": "quality",
};



const TREND_LABEL_KEYS = {
  "vs last 7 days": "vsLast7Days",
  "vs yesterday": "vsYesterday",
  "vs total machines": "vsTotalMachines",
};

const SHOP_FLOOR_KEYS = {
  Running: "running",
  Idle: "idle",
  Setup: "setup",
  Maintenance: "maintenance",
  Breakdown: "breakdown",
};

const INVENTORY_KEYS = ["rawMaterials", "wipItems", "finishedGoods", "lowStockItems"];
const WAREHOUSE_KEYS = ["mainStore", "productionStore", "fgStore", "others"];
const QUICK_ACTION_KEYS = ["newWorkOrder", "productionEntry", "materialIssue", "stockTransfer", "qcEntry", "reports"];
const QUICK_ACTION_MODULES = ["production", "production", "inventory", "inventory", "quality", "analytics"];
const SUMMARY_KEYS = ["manPower", "workingHours", "powerConsumption", "productionEfficiency", "targetAchievement"];
const ALERT_MESSAGE_KEYS = ["alertDelayed", "alertMaintenance", "alertLowStock", "alertQuality", "alertPurchase"];
const ALERT_TIME_META = [
  { key: "minAgo", count: 10 },
  { key: "minAgo", count: 25 },
  { key: "hrAgo", count: 1 },
  { key: "hrsAgo", count: 2 },
  { key: "hrsAgo", count: 3 },
];

const PERIOD_KEYS = { Daily: "daily", Weekly: "weekly", Monthly: "monthly", Yearly: "yearly" };

const PRODUCTION_DATA = {
  Daily: productionOverview,
  Weekly: productionOverviewWeekly,
  Monthly: productionOverviewMonthly,
  Yearly: productionOverviewYearly,
};


const summaryIcons = {
  users: Users,
  clock: Clock,
  zap: Zap,
  gauge: Gauge,
  target: Target,
};

const alertIcons = {
  alert: AlertTriangle,
  wrench: Wrench,
  box: Package,
  check: CheckCircle2,
  cart: ShoppingCart,
};

const blockIcons = {
  boxes: Boxes,
  cog: Wrench,
  package: Package,
  alert: AlertTriangle,
};

function KpiStrip({ cards = [] }) {
  const { t } = useTranslation();

  const visibleCards = cards;

  if (!visibleCards.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        {t("refDashboard.noKpiData", { defaultValue: "No KPI data available yet." })}
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const getKpiRoute = (id) => {
    switch (id) {
      case "total-orders":
        return "/production/planning";
      case "today-production":
        return `/production/planning?date_today=${todayStr}`;
      case "machines-running":
        return "/production/machines?status=running";
      case "pending-orders":
        return "/production/work-orders?status_group=pending";
      case "good-qty":
        return "/production/reports";
      case "reject-qty":
        return "/quality/defects";
      default:
        return "#";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {visibleCards.map((card) => {
        const titleKey = KPI_TITLE_KEYS[card.id];
        const trendKey = TREND_LABEL_KEYS[card.trendLabel];
        const targetRoute = getKpiRoute(card.id);
        return (
          <Link
            key={card.id}
            to={targetRoute}
            className={`relative block overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-4 text-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)]`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                <KpiIcon id={card.id} className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-white/85 leading-tight">
                  {titleKey ? t(`refDashboard.${titleKey}`) : card.title}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums leading-none">
                  {card.value}
                  {card.unit && <span className="ml-1 text-sm font-semibold">{card.unit}</span>}
                  {card.suffix && <span className="text-lg font-semibold text-white/80">{card.suffix}</span>}
                </p>
                <TrendBadge
                  up={card.trendUp}
                  value={card.trend}
                  label={trendKey ? t(`refDashboard.${trendKey}`) : card.trendLabel}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ProductionOverview({ chartSets }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("Daily");
  const chartData = chartSets?.[period] ?? PRODUCTION_DATA[period] ?? productionOverview;
  return (
    <CardShell
      title={t("refDashboard.productionOverview")}
      className="h-full"
      action={
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
          {Object.entries(PERIOD_KEYS).map(([label, key]) => (
            <button
              key={label}
              type="button"
              onClick={() => setPeriod(label)}
              className={`rounded-md px-2.5 py-1 transition-colors ${period === label ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}
            >
              {t(`refDashboard.${key}`)}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} key={period}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="planned" name={t("refDashboard.plannedQty")} stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: "#3B82F6" }} />
            <Line type="monotone" dataKey="actual" name={t("refDashboard.actualQty")} stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: "#22C55E" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );
}

function ShopFloorStatus({ statusData = shopFloorStatus }) {
  const { t } = useTranslation();
  const total = statusData.reduce((s, d) => s + d.value, 0);
  return (
    <CardShell title={t("refDashboard.shopFloorStatus")} className="h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={2}>
                {statusData.map((e) => (
                  <Cell key={e.name} fill={e.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-medium text-slate-500">{t("refDashboard.totalMachines")}</span>
            <span className="text-2xl font-bold text-[#1E293B]">{total}</span>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2 text-sm px-2">
          <ul className="space-y-2">
            {statusData.slice(0, 3).map((item) => {
              const key = SHOP_FLOOR_KEYS[item.name];
              return (
                <li key={item.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-600 min-w-0">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-xs">{key ? t(`refDashboard.${key}`) : item.name}</span>
                  </span>
                  <span className="font-bold text-slate-800 text-xs shrink-0">{item.value}</span>
                </li>
              );
            })}
          </ul>
          <ul className="space-y-2">
            {statusData.slice(3, 5).map((item) => {
              const key = SHOP_FLOOR_KEYS[item.name];
              return (
                <li key={item.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-600 min-w-0">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-xs">{key ? t(`refDashboard.${key}`) : item.name}</span>
                  </span>
                  <span className="font-bold text-slate-800 text-xs shrink-0">{item.value}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </CardShell>
  );
}

function TopMachines({ machines = topMachines }) {
  const { t } = useTranslation();
  return (
    <CardShell title={t("refDashboard.topMachines")} className="h-full">
      <ul className="space-y-3">
        {machines.map((m) => (
          <li key={m.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
              {m.id.split("-")[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-slate-700">{m.id}</span>
                <span className="font-bold text-[#2563EB]">{m.utilization}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#22C55E]" style={{ width: `${m.utilization}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

function OrdersOverview({ overview = ordersOverview }) {
  const { t } = useTranslation();
  const stats = [
    { labelKey: "totalOrders", value: overview.total, color: "text-[#2563EB]" },
    { labelKey: "inProgress", value: overview.inProgress, color: "text-orange-500" },
    { labelKey: "completed", value: overview.completed, color: "text-green-600" },
    { labelKey: "onHold", value: overview.onHold, color: "text-red-500" },
  ];
  return (
    <CardShell title={t("refDashboard.ordersOverview")}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.labelKey} className="rounded-xl bg-slate-50 px-3 py-2.5 text-center">
            <p className="text-[10px] font-medium text-slate-500">{t(`refDashboard.${s.labelKey}`)}</p>
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-medium text-slate-600">{t("refDashboard.overallProgress")}</span>
          <span className="font-bold text-[#2563EB]">{overview.progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]" style={{ width: `${overview.progress}%` }} />
        </div>
      </div>
    </CardShell>
  );
}

function InventorySummary({ summary }) {
  const { t } = useTranslation();

  const blocks = useMemo(() => {
    if (!summary) return inventoryBlocks;
    return [
      { label: "Raw Materials", count: summary.raw_materials_count, icon: "boxes", color: "#3B82F6" },
      { label: "WIP Items", count: summary.wip_items_count, icon: "cog", color: "#F97316" },
      { label: "Finished Goods", count: summary.finished_goods_count, icon: "package", color: "#22C55E" },
      { label: "Low Stock Items", count: summary.low_stock_count, icon: "alert", color: "#EF4444" },
    ];
  }, [summary]);

  const locations = summary?.warehouse_locations ?? warehouseLocations;

  return (
    <CardShell title={t("refDashboard.inventorySummary")}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {blocks.map((b, i) => {
          const Icon = blockIcons[b.icon] || Boxes;
          const labelKey = INVENTORY_KEYS[i];
          return (
            <div key={b.label} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${b.color}18`, color: b.color }}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{b.count.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {labelKey ? t(`refDashboard.${labelKey}`) : b.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mb-2 text-xs font-semibold text-slate-600">{t("refDashboard.warehouseLocation")}</p>
      <div className="flex h-3 overflow-hidden rounded-full">
        {locations.map((w, i) => (
          <div
            key={w.name}
            style={{ width: `${w.pct}%`, backgroundColor: w.color }}
            title={WAREHOUSE_KEYS[i] ? t(`refDashboard.${WAREHOUSE_KEYS[i]}`) : w.name}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
        {locations.map((w, i) => (
          <span key={w.name} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: w.color }} />
            {WAREHOUSE_KEYS[i] ? t(`refDashboard.${WAREHOUSE_KEYS[i]}`) : w.name}
          </span>
        ))}
      </div>
    </CardShell>
  );
}

function AlertsNotifications({ alerts = alertsFeed }) {
  const { t } = useTranslation();
  return (
    <CardShell
      title={t("refDashboard.alertsNotifications")}
      action={<Link to="/production/work-orders" className="text-xs font-semibold text-[#2563EB] hover:underline">{t("common.viewAll")}</Link>}
    >
      <ul className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {alerts.map((a) => {
          const Icon = alertIcons[a.icon] || AlertTriangle;
          return (
            <li key={a.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${a.color}18`, color: a.color }}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-700 leading-snug">
                  {a.message}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {a.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}

function QuickActions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const visible = quickActionsRef.filter((_, i) => userCanAccess(user, QUICK_ACTION_MODULES[i]));
  if (!visible.length) return null;
  return (
    <CardShell title={t("refDashboard.quickActions")}>
      <div className="grid grid-cols-2 gap-3">
        {quickActionsRef.map((a, i) => {
          if (!userCanAccess(user, QUICK_ACTION_MODULES[i])) return null;
          const labelKey = QUICK_ACTION_KEYS[i];
          return (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              style={{ backgroundColor: a.bg }}
            >
              <Plus className="h-5 w-5" />
              <span className="text-[11px] font-semibold leading-tight">
                {labelKey ? t(`refDashboard.${labelKey}`) : a.label}
              </span>
            </Link>
          );
        })}
      </div>
    </CardShell>
  );
}

function RecentWorkOrders({ workOrders = recentWorkOrdersRef }) {
  const { t } = useTranslation();
  return (
    <CardShell
      title={t("refDashboard.recentWorkOrders")}
      action={<Link to="/production/work-orders" className="text-xs font-semibold text-[#2563EB] hover:underline">{t("common.viewAll")}</Link>}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-3 font-semibold">{t("refDashboard.woNo")}</th>
              <th className="pb-2 pr-3 font-semibold">{t("refDashboard.product")}</th>
              <th className="pb-2 pr-3 font-semibold">{t("refDashboard.qty")}</th>
              <th className="pb-2 pr-3 font-semibold">{t("refDashboard.status")}</th>
              <th className="pb-2 font-semibold">{t("refDashboard.dueDate")}</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((wo) => (
              <tr key={wo.wo} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 pr-3 font-semibold text-[#2563EB]">{wo.wo}</td>
                <td className="py-2.5 pr-3 text-slate-700">{wo.product}</td>
                <td className="py-2.5 pr-3 tabular-nums">{wo.qty}</td>
                <td className="py-2.5 pr-3"><StatusBadge status={wo.status} /></td>
                <td className="py-2.5 text-slate-500 text-xs">{wo.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}

function TodaysSummary({ summary }) {
  const { t } = useTranslation();
  const items = summary ?? todaysSummaryRef;
  return (
    <CardShell title={t("refDashboard.todaysSummary")}>
      <ul className="space-y-3">
        {items.map((item, i) => {
          const Icon = summaryIcons[item.icon] || BarChart3;
          const labelKey = SUMMARY_KEYS[i];
          return (
            <li key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="flex items-center gap-2.5 text-sm text-slate-600">
                <Icon className="h-4 w-4 text-[#2563EB]" />
                {labelKey ? t(`refDashboard.${labelKey}`) : item.label}
              </span>
              <span className="text-sm font-bold text-slate-800">{item.value}</span>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}

export default function ReferenceDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    getErpDashboard()
      .then((res) => setApiData(res.data))
      .catch(() => setApiData(null));
  }, []);

  const kpiCardsLive = useMemo(() => {
    const cardsToUse = apiData?.kpi_cards || [];
    const byId = Object.fromEntries(kpiCards.map((c) => [c.id, c]));
    if (!apiData) {
      return kpiCards.map((c) => ({
        ...c,
        value: "0",
        suffix: c.suffix ? "/ 0" : undefined,
        trend: "0%",
      }));
    }
    return cardsToUse.map((k) => ({
      ...byId[k.id],
      ...k,
      value: k.value,
      trend: k.trend,
      trendUp: k.trendUp,
      trendLabel: k.trendLabel,
      unit: k.unit,
      suffix: k.suffix,
    }));
  }, [apiData]);

  const chartSets = useMemo(() => {
    if (!apiData) return null;
    return {
      Daily: apiData.production_overview || [],
      Weekly: apiData.production_overview_weekly || [],
      Monthly: apiData.production_overview_monthly || [],
      Yearly: apiData.production_overview_yearly || [],
    };
  }, [apiData]);

  const alertsLive = useMemo(() => {
    if (!apiData) return [];
    return (apiData.alerts_feed || []).map((a, i) => ({
      id: a.id || i + 1,
      message: a.message,
      time: a.time || "",
      color: a.color || "#EF4444",
      icon: a.icon || "alert",
    }));
  }, [apiData]);

  const workOrdersLive = useMemo(() => {
    if (!apiData) return [];
    return apiData.recent_work_orders.map((w) => ({
      wo: w.wo,
      product: w.product,
      qty: w.qty,
      status: w.status,
      due: w.due ? String(w.due).slice(0, 10) : "—",
    }));
  }, [apiData]);

  const hasQuickActions = quickActionsRef.some((_, i) => userCanAccess(user, QUICK_ACTION_MODULES[i]));

  return (
    <div className="space-y-5 pb-4">
      <KpiStrip cards={kpiCardsLive} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <ProductionOverview chartSets={chartSets} />
        </div>
        <div className="xl:col-span-3">
          <ShopFloorStatus statusData={apiData ? apiData.shop_floor_status : []} />
        </div>
        <div className="xl:col-span-4">
          <TopMachines machines={apiData ? apiData.top_machines : []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <OrdersOverview overview={apiData ? apiData.orders_overview : { total: 0, inProgress: 0, completed: 0, onHold: 0, progress: 0 }} />
        <InventorySummary summary={apiData ? apiData.inventory_summary : { raw_materials_count: 0, wip_items_count: 0, finished_goods_count: 0, low_stock_count: 0, warehouse_locations: [] }} />
        <AlertsNotifications alerts={alertsLive} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {hasQuickActions && (
          <div className="xl:col-span-3">
            <QuickActions />
          </div>
        )}
        <div className={hasQuickActions ? "xl:col-span-5" : "xl:col-span-7"}>
          <RecentWorkOrders workOrders={workOrdersLive} />
        </div>
        <div className={hasQuickActions ? "xl:col-span-4" : "xl:col-span-5"}>
          <TodaysSummary summary={apiData ? apiData.todays_summary : []} />
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 sm:flex-row sm:text-left">
        <p>{t("refDashboard.copyright")}</p>
        <p>{t("refDashboard.poweredBy")}</p>
      </footer>
    </div>
  );
}
