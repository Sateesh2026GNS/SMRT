import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ClipboardList, Download, Filter, Plus, RefreshCw } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getMREnriched, getMRSummary } from "../../api/procurementApi";
import {
  DEMO_MR_LIST,
  DEMO_MR_SUMMARY,
  MR_DEPARTMENTS,
  MR_PRIORITIES,
  priorityColor,
  statusColor,
} from "../../data/procurementMasterData";
import { exportToExcel } from "../../utils/exportUtils";

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowStrip({ steps }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          <span className="rounded-lg bg-white px-2 py-1 shadow-sm">{s}</span>
          {i < steps.length - 1 && <span className="text-slate-400">↓</span>}
        </span>
      ))}
    </div>
  );
}

function MRDetailModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">{row.mr_number}</h2>
        <p className="text-sm text-slate-500">{row.department} · {row.requested_by}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-400">Priority</p><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColor(row.priority)}`}>{row.priority}</span></div>
          <div><p className="text-xs text-slate-400">Items</p><p className="font-medium">{row.item_count}</p></div>
          <div><p className="text-xs text-slate-400">Required Date</p><p className="font-medium">{row.required_date || "—"}</p></div>
          <div><p className="text-xs text-slate-400">Approval</p><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(row.approval_status)}`}>{row.approval_status}</span></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700">Close</button>
          <Link to="/procurement/rfq" className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Convert to RFQ</Link>
        </div>
      </div>
    </div>
  );
}

const defaultFilters = { department: "", priority: "", status: "", requested_by: "" };

export default function MaterialRequests() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_MR_SUMMARY);
  const [rows, setRows] = useState(DEMO_MR_LIST);
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getMRSummary(), getMREnriched()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_MR_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setRows(listRes.value.data);
      else setRows(DEMO_MR_LIST);
    } catch {
      addToast("Using demo material request data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filters.department) list = list.filter((r) => r.department === filters.department);
    if (filters.priority) list = list.filter((r) => r.priority === filters.priority);
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    if (filters.requested_by) list = list.filter((r) => r.requested_by?.toLowerCase().includes(filters.requested_by.toLowerCase()));
    return list;
  }, [rows, filters]);

  const columns = [
    { key: "mr_number", label: "MR No" },
    { key: "request_date", label: "Date", render: (r) => String(r.request_date || "").slice(0, 10) },
    { key: "department", label: "Department" },
    { key: "requested_by", label: "Requested By" },
    { key: "priority", label: "Priority", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${priorityColor(r.priority)}`}>{r.priority}</span> },
    { key: "item_count", label: "Items" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "approval_status", label: "Approval", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.approval_status)}`}>{r.approval_status}</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <button type="button" onClick={() => setSelected(r)} className="text-xs font-semibold text-[#2563EB] hover:underline">View</button>
    )},
  ];

  if (loading) return <Loader label="Loading material requests..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Material Requests</h1>
          <p className="mt-1 text-sm text-slate-500">Enterprise purchase requests with multi-level approval and RFQ conversion.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/procurement/material-requests/create" className="ui-btn-primary"><Plus className="h-4 w-4" /> New Material Request</Link>
          <button type="button" onClick={() => exportToExcel(filtered, columns.filter((c) => !c.render), "material-requests")} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Export</button>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Requests" value={summary.total_requests} icon={ClipboardList} color="bg-blue-600" />
        <KpiCard label="Pending Approval" value={summary.pending_approval} icon={AlertCircle} color="bg-amber-500" />
        <KpiCard label="Approved" value={summary.approved} icon={ClipboardList} color="bg-green-600" />
        <KpiCard label="Rejected" value={summary.rejected} icon={AlertCircle} color="bg-red-500" />
        <KpiCard label="Converted to RFQ" value={summary.converted_to_rfq} icon={ClipboardList} color="bg-indigo-600" />
        <KpiCard label="Urgent Requests" value={summary.urgent_requests} icon={AlertCircle} color="bg-orange-500" />
      </div>

      <WorkflowStrip steps={["Department", "Material Request", "Manager Approval", "Purchase Team", "RFQ"]} />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter className="h-4 w-4" /> Advanced Filters</button>
        {showAdvanced && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Departments</option>
              {MR_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Priorities</option>
              {MR_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Status</option>
              {["pending", "approved", "rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={filters.requested_by} onChange={(e) => setFilters({ ...filters, requested_by: e.target.value })} placeholder="Requested by" className="rounded-lg border px-3 py-2 text-sm" />
          </div>
        )}
        <DataTable columns={columns} data={filtered} searchPlaceholder="Search MR, department, requester..." searchKeys={["mr_number", "department", "requested_by"]} />
      </div>

      {selected && <MRDetailModal row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
