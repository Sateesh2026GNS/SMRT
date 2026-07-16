import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import { useToast } from "../../context/ToastContext";
import {
  getProductionForecast,
  getDemandForecast,
  getInventoryForecast,
} from "../../api/forecastingApi";

export default function ForecastingDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [production, setProduction] = useState(null);
  const [demand, setDemand] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [atRisk, setAtRisk] = useState(0);

  useEffect(() => {
    Promise.all([
      getProductionForecast(),
      getDemandForecast(),
      getInventoryForecast(),
    ])
      .then(([p, d, i]) => {
        setProduction(p.data);
        setDemand(d.data);
        setInventoryItems(i.data?.items || []);
        setAtRisk(i.data?.items_at_risk || 0);
      })
      .catch((err) => {
        addToast(err.response?.data?.detail || "Failed to load forecasts", "error");
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  if (loading) return <Loader label="Loading forecasts..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecasting"
        subtitle="Production, demand, and inventory replenishment projections."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500">Avg daily output</p>
          <p className="mt-1 text-2xl font-bold">{production?.avg_daily_output ?? 0}</p>
          <p className="text-xs text-slate-400">Based on {production?.based_on_records ?? 0} reports</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500">Projected weekly output</p>
          <p className="mt-1 text-2xl font-bold">{production?.projected_weekly_output ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500">Total order value</p>
          <p className="mt-1 text-2xl font-bold">
            ₹{Number(demand?.total_order_value || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400">{demand?.total_orders ?? 0} orders</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500">Items at reorder risk</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{atRisk}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Inventory Replenishment</h2>
        <DataTable
          columns={[
            { key: "sku", label: "SKU" },
            { key: "item", label: "Item" },
            { key: "on_hand", label: "On Hand" },
            { key: "reorder_level", label: "Reorder Level" },
            {
              key: "needs_reorder",
              label: "Status",
              render: (r) =>
                r.needs_reorder ? (
                  <span className="text-amber-600 font-medium">Reorder</span>
                ) : (
                  "OK"
                ),
            },
          ]}
          data={inventoryItems}
          searchKeys={["sku", "item"]}
        />
      </div>
    </div>
  );
}
