import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock, RefreshCw, Timer, Wrench, Zap } from "lucide-react";
import RowActionMenu from "../../components/common/RowActionMenu";

import DataTable from "../../components/common/DataTable";
import MaintenanceErrorState from "../../components/maintenance/MaintenanceErrorState";
import MaintenanceFilters from "../../components/maintenance/MaintenanceFilters";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getBreakdownsEnriched, getBreakdownSummary, updateBreakdownStatus } from "../../api/maintenanceApi";
import { WORK_ORDER_FLOW, mntStatusColor, priorityColor } from "../../data/maintenanceMasterData";

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

const STATUS_NEXT = { reported: "assigned", assigned: "in_progress", in_progress: "resolved" };

const INITIAL_BREAKDOWN_SUMMARY = {
  active_breakdowns: 0,
  total_downtime_hours: 0,
  avg_repair_time_mttr: 0,
  machine_availability_pct: 0,
  pending_repairs: 0,
  emergency_breakdowns: 0,
};

export default function BreakdownReports() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(INITIAL_BREAKDOWN_SUMMARY);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getBreakdownSummary(), getBreakdownsEnriched()]);
      if (sumRes.status === "rejected" && listRes.status === "rejected") throw new Error("Network error");
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary(sumRes.value.data);
      if (listRes.status === "fulfilled" && listRes.value?.data) setRows(listRes.value.data);
      if (sumRes.status === "rejected" || listRes.status === "rejected") addToast("Failed to load some breakdown data", "warning");
    } catch (e) {
      setError(e.message || "Failed to load data");
      setSummary(INITIAL_BREAKDOWN_SUMMARY);
      setRows([]);
      addToast("Failed to load breakdown data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const advance = async (row) => {
    const next = STATUS_NEXT[row.status];
    if (!next) return;
    try {
      await updateBreakdownStatus(row.id, next);
      addToast(`Breakdown moved to ${next.replace("_", " ")}`);
      load();
    } catch {
      addToast("Update failed", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      if (q && ![r.breakdown_number, r.machine_name, r.cause, r.engineer].some((v) => String(v || "").toLowerCase().includes(q))) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const columns = [
    { key: "breakdown_number", label: "Breakdown No" },
    { key: "machine_name", label: "Machine" },
    { key: "department", label: "Department" },
    { key: "reported_by", label: "Reported By" },
    { key: "reported_time", label: "Reported Time", render: (r) => String(r.reported_time || "").slice(0, 16).replace("T", " ") },
    { key: "cause", label: "Cause" },
    { key: "severity", label: "Severity", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${priorityColor(r.severity)}`}>{r.severity}</span> },
    { key: "priority", label: "Priority", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${priorityColor(r.priority)}`}>{r.priority}</span> },
    { key: "engineer", label: "Engineer" },
    { key: "estimated_completion", label: "Est. Completion", render: (r) => r.estimated_completion ? String(r.estimated_completion).slice(0, 16).replace("T", " ") : "—" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${mntStatusColor(r.status)}`}>{r.status.replace("_", " ")}</span> },
    {
      key: "actions", label: "Action", sortable: false,
      render: (r) => (
        <RowActionMenu
          rowId={r.id}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          items={[
            {
              label: STATUS_NEXT[r.status] ? `Advance to ${STATUS_NEXT[r.status].replace("_", " ")}` : "Closed",
              icon: <ArrowRight className="h-4 w-4" />,
              onClick: () => advance(r),
              hidden: !STATUS_NEXT[r.status],
            },
          ]}
        />
      ),
    },
  ];

  if (loading) return <Loader label="Loading breakdown maintenance..." />;
  if (error && !rows.length) return <MaintenanceErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Breakdown Maintenance</h1>
          <p className="mt-1 text-sm text-slate-500">Critical production breakdowns — downtime tracking, MTTR, and repair workflow.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active Breakdowns" value={summary.active_breakdowns} icon={AlertTriangle} color="bg-red-500" />
        <KpiCard label="Total Downtime" value={summary.total_downtime_hours} suffix=" h" icon={Clock} color="bg-orange-500" />
        <KpiCard label="MTTR" value={summary.avg_repair_time_mttr} suffix=" h" icon={Timer} color="bg-indigo-600" />
        <KpiCard label="Machine Availability" value={summary.machine_availability_pct} suffix="%" icon={Wrench} color="bg-teal-600" />
        <KpiCard label="Pending Repairs" value={summary.pending_repairs} icon={Clock} color="bg-amber-500" />
        <KpiCard label="Emergency" value={summary.emergency_breakdowns} icon={Zap} color="bg-red-700" />
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-medium text-slate-600 sm:text-xs">
        {WORK_ORDER_FLOW.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span className="rounded bg-white px-1.5 py-0.5 shadow-sm">{s}</span>
            {i < WORK_ORDER_FLOW.length - 1 && <span className="text-slate-400">↓</span>}
          </span>
        ))}
      </div>

      <MaintenanceFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} searchPlaceholder="Search breakdown, machine, cause..." />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
        <DataTable columns={columns} data={filtered} searchPlaceholder="" searchKeys={[]} />
      </div>
    </div>
  );
}
