import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, Clock, Plus, RefreshCw, XCircle } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getLeaveEnriched, getLeaveSummary, updateLeaveRequest } from "../../api/hrApi";
import { DEMO_LEAVE_LIST, DEMO_LEAVE_SUMMARY, LEAVE_TYPES, statusColor } from "../../data/hrMasterData";

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>
        {Icon && <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5 text-white" /></div>}
      </div>
    </div>
  );
}

export default function Leave() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_LEAVE_SUMMARY);
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [view, setView] = useState("table");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getLeaveSummary(), getLeaveEnriched()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_LEAVE_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setRows(listRes.value.data);
      else setRows([]);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!statusFilter) return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  const handleStatus = async (id, status) => {
    if (typeof id === "number") {
      try {
        await updateLeaveRequest(id, { status });
        addToast(`Leave ${status}`);
        load();
      } catch (err) {
        addToast(err.response?.data?.detail || "Update failed", "error");
      }
    } else {
      addToast(`Leave ${status} (demo)`);
      load();
    }
  };

  const columns = [
    { key: "employee_name", label: "Employee" },
    { key: "leave_type", label: "Type", render: (r) => <span className="capitalize">{r.leave_type?.replace("_", " ")}</span> },
    { key: "start_date", label: "From" },
    { key: "end_date", label: "To" },
    { key: "days", label: "Days" },
    { key: "reason", label: "Reason", render: (r) => r.reason || "—" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "actions", label: "Actions", render: (r) => r.status === "pending" ? (
      <div className="flex gap-2">
        <button type="button" onClick={() => handleStatus(r.id, "approved")} className="text-xs font-semibold text-green-600 hover:underline">Approve</button>
        <button type="button" onClick={() => handleStatus(r.id, "rejected")} className="text-xs font-semibold text-red-600 hover:underline">Reject</button>
      </div>
    ) : "—" },
  ];

  if (loading) return <Loader label="Loading leave requests..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-1 text-sm text-slate-500">Leave calendar, multi-level approval workflow, and balance tracking.</p>
        </div>
        <Link to="/hr/leave/create" className="ui-btn-primary"><Plus className="h-4 w-4" /> Request Leave</Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Pending" value={summary.pending_leave} icon={Clock} color="bg-amber-500" />
        <KpiCard label="Approved" value={summary.approved} icon={CheckCircle} color="bg-green-600" />
        <KpiCard label="Rejected" value={summary.rejected} icon={XCircle} color="bg-red-500" />
        <KpiCard label="Available" value={summary.available_leave} icon={Calendar} color="bg-blue-600" />
        <KpiCard label="Sick Leave" value={summary.sick_leave} icon={Calendar} color="bg-orange-500" />
        <KpiCard label="Casual" value={summary.casual_leave} icon={Calendar} color="bg-indigo-600" />
        <KpiCard label="Earned" value={summary.earned_leave} icon={Calendar} color="bg-teal-600" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
        {["Employee", "Manager", "HR", "Approved"].map((s, i, arr) => (
          <span key={s} className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-2 py-1 shadow-sm">{s}</span>
            {i < arr.length - 1 && <span className="text-slate-400">↓</span>}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All Status</option>
          {["pending", "approved", "rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          <button type="button" onClick={() => setView("table")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "table" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}>Table</button>
          <button type="button" onClick={() => setView("calendar")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "calendar" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}>Calendar</button>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {view === "table" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <DataTable columns={columns} data={filtered} searchPlaceholder="Search employee, type..." searchKeys={["employee_name", "leave_type"]} />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">July 2026 — Leave Calendar</h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2 font-semibold text-slate-500">{d}</div>)}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasLeave = filtered.some((l) => {
                const s = new Date(l.start_date).getDate();
                const e = new Date(l.end_date).getDate();
                return day >= s && day <= e;
              });
              return (
                <div key={day} className={`rounded-lg py-2 ${hasLeave ? "bg-amber-100 font-semibold text-amber-800" : "text-slate-600"}`}>{day}</div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {LEAVE_TYPES.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">{t.replace("_", " ")}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
