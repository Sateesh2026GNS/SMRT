import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { useToast } from "../../context/ToastContext";
import { getInventoryTurnover } from "../../api/analyticsApi";

export default function InventoryAnalytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getInventoryTurnover();
        if (active) setData(res.data || null);
      } catch (err) {
        if (active) addToast(err.response?.data?.detail || "Failed to load inventory analytics", "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [addToast]);

  if (loading) return <Loader label="Loading inventory analytics..." />;
  if (!data) return <EmptyState icon="cube" title="No data" description="Inventory analytics are unavailable." />;

  const chartData = [
    { name: "Out Movements", value: data.total_out_movements },
    { name: "Avg Inventory", value: data.average_inventory },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Analytics"
        subtitle="Turnover and stock flow over the last 12 months."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Turnover Rate" value={`${data.rate}x`} accent />
        <StatCard label="Total Outflow" value={Number(data.total_out_movements).toLocaleString()} />
        <StatCard label="Average Inventory" value={Number(data.average_inventory).toLocaleString()} />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Outflow vs Average Inventory
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className="mt-1 text-2xl font-bold"
        style={{ color: accent ? "var(--color-primary)" : undefined }}
      >
        {value}
      </p>
    </div>
  );
}
