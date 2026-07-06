import { useEffect, useState } from "react";
import { Factory } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { StatusBadge } from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import { getProductionLines } from "../../api/factoryMonitorApi";

export default function ProductionLines() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    getProductionLines()
      .then((r) => setLines(r.data || []))
      .catch((err) => {
        addToast(err.response?.data?.detail || "Failed to load production lines", "error");
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  if (loading) return <Loader label="Loading production lines..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Lines"
        subtitle="Live status of each production line / machine station."
      />

      {lines.length === 0 ? (
        <EmptyState
          icon="factory"
          title="No production lines"
          description="Add machines to monitor production lines."
          actionLabel="Add Machine"
          actionHref="/production/machines/create"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lines.map((line) => (
            <div
              key={line.machine_id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-teal-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {line.line}
                  </h3>
                </div>
                <StatusBadge status={line.status} />
              </div>
              <dl className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <dt>Code</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {line.code || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Location</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {line.location || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Active Work Orders</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {line.active_work_orders}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
