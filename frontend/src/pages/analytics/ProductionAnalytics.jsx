import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { useToast } from "../../context/ToastContext";
import { getProductionTrend, getWorkerPerformance } from "../../api/analyticsApi";

export default function ProductionAnalytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState([]);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [t, w] = await Promise.all([
          getProductionTrend(),
          getWorkerPerformance(),
        ]);
        if (!active) return;
        setTrend(t.data || []);
        setWorker(w.data || null);
      } catch (err) {
        if (active) addToast(err.response?.data?.detail || "Failed to load analytics", "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [addToast]);

  if (loading) return <Loader label="Loading production analytics..." />;

  const totalProduced = trend.reduce((s, m) => s + (m.value || 0), 0);
  const hasData = totalProduced > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Analytics"
        subtitle="Monthly output trends and workforce performance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Output (YTD)" value={totalProduced.toLocaleString()} />
        <StatCard
          label="Avg / Month"
          value={Math.round(totalProduced / 12).toLocaleString()}
        />
        <StatCard
          label="Worker Performance"
          value={worker ? `${worker.average_score}%` : "—"}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Monthly Production Volume
        </h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} name="Produced" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon="chart" title="No production data" description="Record daily production reports to see trends." />
        )}
      </div>

      {hasData && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Trend Line
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} name="Produced" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
