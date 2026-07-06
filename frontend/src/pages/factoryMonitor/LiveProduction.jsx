import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Factory, ArrowRight } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { StatusBadge } from "../../components/common/Table";
import { getLiveProduction } from "../../api/factoryMonitorApi";

export default function LiveProduction() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getLiveProduction()
      .then((r) => setRows(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading live production..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Production"
        subtitle="Active work orders across the factory floor."
        action={
          <div className="flex gap-2">
            <Link
              to="/factory-monitor/machine-status"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50"
            >
              Machine Status
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/production"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Factory className="h-4 w-4" />
              Production Hub
            </Link>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon="factory"
          title="No active work orders"
          description="Start a work order from Production Planning to see live status here."
          actionLabel="Open planning"
          actionHref="/production/planning"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r.work_order_id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-teal-600">{r.work_order_number}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {r.product}
              </p>
              <p className="text-xs text-slate-500">{r.machine}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>{r.progress_pct}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-teal-500"
                    style={{ width: `${Math.min(100, r.progress_pct)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {r.actual_quantity} / {r.planned_quantity} units
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
