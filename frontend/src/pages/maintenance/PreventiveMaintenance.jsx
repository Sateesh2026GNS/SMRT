import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calendar, CheckCircle, Clock, Cog, RefreshCw, Wrench } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import MaintenanceErrorState from "../../components/maintenance/MaintenanceErrorState";
import MaintenanceFilters from "../../components/maintenance/MaintenanceFilters";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getPreventiveEnriched, getPreventiveSummary } from "../../api/maintenanceApi";
import { MAINTENANCE_FLOW, mntStatusColor } from "../../data/maintenanceMasterData";

function KpiCard({ label, value, icon: Icon, color, suffix }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}{suffix || ""}</p></div>
        {Icon && <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5 text-white" /></div>}
      </div>
    </div>
  );
}

const INITIAL_PREVENTIVE_SUMMARY = {
  total_machines: 0,
  scheduled_today: 0,
  overdue_tasks: 0,
  completed_this_month: 0,
  upcoming_maintenance: 0,
  machine_availability_pct: 0,
};

export default function PreventiveMaintenance() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(INITIAL_PREVENTIVE_SUMMARY);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getPreventiveSummary(), getPreventiveEnriched()]);
      if (sumRes.status === "rejected" && listRes.status === "rejected") throw new Error("Network error");
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary(sumRes.value.data);
      if (listRes.status === "fulfilled" && listRes.value?.data) setRows(listRes.value.data);
      if (sumRes.status === "rejected" || listRes.status === "rejected") addToast("Failed to load some preventive maintenance data", "warning");
    } catch (e) {
      setError(e.message || "Failed to load data");
      setSummary(INITIAL_PREVENTIVE_SUMMARY);
      setRows([]);
      addToast("Failed to load preventive maintenance data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      if (q && ![r.machine_name, r.machine_id, r.assigned_engineer, r.task_description].some((v) => String(v || "").toLowerCase().includes(q))) return false;
      if (statusFilter === "overdue" && !r.is_overdue) return false;
      if (statusFilter && statusFilter !== "overdue" && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const columns = [
    { key: "machine_id", label: "Machine ID" },
    { key: "machine_name", label: "Machine Name" },
    { key: "department", label: "Department" },
    { key: "maintenance_type", label: "Maintenance Type" },
    { key: "scheduled_date", label: "Scheduled Date", render: (r) => String(r.scheduled_date || "").slice(0, 10) },
    { key: "assigned_engineer", label: "Assigned Engineer" },
    { key: "estimated_duration", label: "Est. Duration" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${mntStatusColor(r.status)}`}>{r.status}</span> },
    {
      key: "next_due_date", label: "Next Due Date",
      render: (r) => (
        <span className={r.is_overdue ? "font-semibold text-red-600" : ""}>
          {String(r.next_due_date || "").slice(0, 10)}
          {r.is_overdue && <span className="ml-1 text-xs text-red-500">(Overdue)</span>}
        </span>
      ),
    },
  ];

  if (loading) return <Loader label="Loading preventive maintenance..." />;
  if (error && !rows.length) return <MaintenanceErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Preventive Maintenance</h1>
          <p className="mt-1 text-sm text-slate-500">Schedule and track recurring maintenance tasks across all machines.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Machines" value={summary.total_machines} icon={Cog} color="bg-blue-600" />
        <KpiCard label="Scheduled Today" value={summary.scheduled_today} icon={Calendar} color="bg-indigo-600" />
        <KpiCard label="Overdue Tasks" value={summary.overdue_tasks} icon={AlertTriangle} color="bg-red-500" />
        <KpiCard label="Completed This Month" value={summary.completed_this_month} icon={CheckCircle} color="bg-green-600" />
        <KpiCard label="Upcoming" value={summary.upcoming_maintenance} icon={Clock} color="bg-amber-500" />
        <KpiCard label="Machine Availability" value={summary.machine_availability_pct} suffix="%" icon={Wrench} color="bg-teal-600" />
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-medium text-slate-600 sm:text-xs">
        {MAINTENANCE_FLOW.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span className="rounded bg-white px-1.5 py-0.5 shadow-sm">{s}</span>
            {i < MAINTENANCE_FLOW.length - 1 && <span className="text-slate-400">↓</span>}
          </span>
        ))}
      </div>

      <MaintenanceFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} searchPlaceholder="Search machine, engineer, task..." />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DataTable columns={columns} data={filtered} searchPlaceholder="" searchKeys={[]} />
      </div>
    </div>
  );
}
