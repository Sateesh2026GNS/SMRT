import { useCallback, useEffect, useState } from "react";
import {
  IndianRupee, ShoppingCart, Users, Percent, TrendingUp, Truck, Target, BarChart3,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart,
} from "recharts";

import Loader from "../../components/common/Loader";
import AnalyticsAlertsBanner from "../../components/analytics/AnalyticsAlertsBanner";
import AnalyticsChartCard from "../../components/analytics/AnalyticsChartCard";
import AnalyticsDashboardHeader from "../../components/analytics/AnalyticsDashboardHeader";
import AnalyticsFilterBar from "../../components/analytics/AnalyticsFilterBar";
import AnalyticsKpiCard from "../../components/analytics/AnalyticsKpiCard";
import DrillDownBreadcrumb from "../../components/analytics/DrillDownBreadcrumb";
import { useToast } from "../../context/ToastContext";
import { getSalesAnalytics } from "../../api/analyticsApi";
import { CHART_COLORS, SOURCE_LINKS, formatInr } from "../../data/analyticsMasterData";

const KPI_ICONS = {
  revenue: IndianRupee, orders: ShoppingCart, customers: Users, conversion: Percent,
  aov: Target, growth: TrendingUp, pending: BarChart3, dispatch: Truck,
};

const INITIAL_SALES = {
  kpis: [
    { key: "revenue", label: "Revenue", value: 0, change_pct: null, format: "currency", drill_target: "month" },
    { key: "orders", label: "Orders", value: 0, change_pct: null, format: "number", drill_target: "orders" },
    { key: "customers", label: "Customers", value: 0, change_pct: null, format: "number", drill_target: "customer" },
    { key: "conversion", label: "Conversion Rate", value: 0, change_pct: null, unit: "%", format: "percent", drill_target: "funnel" },
    { key: "aov", label: "Average Order Value", value: 0, change_pct: null, format: "currency", drill_target: "orders" },
    { key: "growth", label: "Sales Growth", value: 0, change_pct: null, unit: "%", format: "percent", drill_target: "month" },
    { key: "pending", label: "Pending Orders", value: 0, change_pct: null, format: "number", drill_target: "orders" },
    { key: "dispatch", label: "Dispatch Performance", value: 0, change_pct: null, unit: "%", format: "percent", drill_target: "dispatch" },
  ],
  alerts: [],
  monthly_revenue: [],
  top_customers: [],
  top_products: [],
  regional_sales: [],
  sales_funnel: [],
  quotation_conversion: [],
  order_status: [],
  drill_revenue: [],
  last_updated: new Date().toISOString(),
};

export default function SalesAnalytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(INITIAL_SALES);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [drillTrail, setDrillTrail] = useState([]);
  const [filters, setFilters] = useState({
    fiscalYear: "2025-26", month: "All Months", quarter: "All Quarters",
    plant: "All Plants", customer: "All Customers", dateFrom: "", dateTo: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalesAnalytics();
      if (res.data) {
        setData(res.data);
        setDrillTrail(res.data.drill_revenue || []);
      }
    } catch {
      setData(INITIAL_SALES);
      setDrillTrail([]);
      addToast("Failed to load sales analytics data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [autoRefresh, load]);

  if (loading && !data.kpis) return <Loader label="Loading sales analytics..." />;
  const setF = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));

  const handleKpiClick = (kpi) => {
    if (kpi.key === "revenue" && data.drill_revenue) setDrillTrail(data.drill_revenue);
  };

  return (
    <div className="space-y-6 bg-slate-50 p-4 dark:bg-slate-900 sm:p-6">
      <AnalyticsDashboardHeader
        title="Sales Analytics"
        subtitle="Revenue, orders, funnel, top customers/products — integrated with Sales module."
        lastUpdated={data.last_updated}
        onRefresh={load}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        loading={loading}
      />

      <AnalyticsAlertsBanner alerts={data.alerts} />
      <DrillDownBreadcrumb trail={drillTrail} onSelect={(_, i) => setDrillTrail(drillTrail.slice(0, i + 1))} />

      <AnalyticsFilterBar
        fiscalYear={filters.fiscalYear} onFiscalYearChange={setF("fiscalYear")}
        month={filters.month} onMonthChange={setF("month")}
        quarter={filters.quarter} onQuarterChange={setF("quarter")}
        plant={filters.plant} onPlantChange={setF("plant")}
        customer={filters.customer} onCustomerChange={setF("customer")}
        dateFrom={filters.dateFrom} onDateFromChange={setF("dateFrom")}
        dateTo={filters.dateTo} onDateToChange={setF("dateTo")}
        showAll={false}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data.kpis || []).map((kpi) => (
          <AnalyticsKpiCard key={kpi.key} kpi={kpi} icon={KPI_ICONS[kpi.key]} onClick={handleKpiClick} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard id="chart-monthly-rev" title="Monthly Revenue" data={data.monthly_revenue} sourceLink={SOURCE_LINKS.sales} sourceLabel="Sales">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => formatInr(v)} />
              <Tooltip formatter={(v) => [formatInr(v), "Revenue"]} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard id="chart-top-cust" title="Top Customers" data={data.top_customers} sourceLink={SOURCE_LINKS.sales} sourceLabel="Sales">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.top_customers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => formatInr(v)} fontSize={10} />
              <YAxis dataKey="label" type="category" width={100} fontSize={10} />
              <Tooltip formatter={(v) => [formatInr(v), "Revenue"]} />
              <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard id="chart-top-prod" title="Top Products" data={data.top_products} sourceLink={SOURCE_LINKS.sales} sourceLabel="Sales">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.top_products}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={10} />
              <YAxis tickFormatter={(v) => formatInr(v)} fontSize={11} />
              <Tooltip formatter={(v) => [formatInr(v), "Revenue"]} />
              <Bar dataKey="value" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard id="chart-regional" title="Regional Sales" data={data.regional_sales} sourceLink={SOURCE_LINKS.sales} sourceLabel="Sales">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.regional_sales} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ label, value }) => `${label} ${value}%`}>
                {data.regional_sales.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard id="chart-funnel" title="Sales Funnel" data={data.sales_funnel} sourceLink="/sales/leads" sourceLabel="Leads">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sales_funnel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={10} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard id="chart-quote-conv" title="Quotation Conversion" data={data.quotation_conversion} sourceLink="/sales/quotations" sourceLabel="Quotations">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.quotation_conversion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 25]} />
              <Tooltip formatter={(v) => [`${v}%`, "Conversion"]} />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS[4]} strokeWidth={2} name="%" />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard id="chart-order-status" title="Order Status" data={data.order_status} sourceLink="/sales/orders" sourceLabel="Sales Orders">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.order_status} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                {data.order_status.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>
      </div>
    </div>
  );
}
