import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Pause,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Star,
} from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import WorkOrderDetailModal, {
  WorkOrderCompleteModal,
  WorkOrderStartModal,
} from "../../components/production/WorkOrderDetailModal";
import { useToast } from "../../context/ToastContext";
import {
  completeWorkOrder,
  getWorkOrderDetail,
  getWorkOrders,
  getWorkOrderStartChecks,
  getWorkOrderSummary,
  pauseWorkOrder,
  startWorkOrder,
  stopWorkOrder,
} from "../../api/productionApi";
import {
  DEMO_WORK_ORDERS,
  DEMO_WO_SUMMARY,
  DEPARTMENTS,
  PRIORITIES,
  SHIFTS,
  STATUS_FLOW,
  WO_STATUSES,
  WORKFLOW_STEPS,
  canWoComplete,
  canWoPause,
  canWoStart,
  canWoStop,
  computeWorkOrderSummary,
  enrichApiWorkOrder,
  priorityBadge,
  woStatusLabel,
} from "../../data/workOrdersMasterData";
import { exportToExcel, exportToPdf } from "../../utils/exportUtils";

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function PriorityPill({ priority }) {
  const p = priorityBadge(priority);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${p.bg} ${p.text}`}>
      {p.dot} {p.label}
    </span>
  );
}

function ProgressCell({ row }) {
  const produced = row.produced_quantity ?? row.actual_quantity ?? 0;
  const planned = row.planned_quantity || 0;
  const pct = row.progress_pct ?? (planned ? Math.round((produced / planned) * 100) : 0);
  return (
    <div className="min-w-[110px]">
      <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
        <span>{produced} / {planned}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function MachineCell({ row }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-800">{row.machine_name || "—"}</p>
      <p className="text-[10px] capitalize text-slate-500">{row.machine_status || "—"}</p>
    </div>
  );
}

const defaultFilters = {
  work_order_number: "",
  production_order: "",
  product: "",
  customer: "",
  machine: "",
  operator: "",
  department: "",
  shift: "",
  priority: "",
  status: "",
  date_from: "",
  date_to: "",
};

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val).slice(0, 10) : d.toLocaleDateString(undefined, { dateStyle: "short" });
}

export default function WorkOrders() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const poFilter = searchParams.get("production_order_id");
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startModal, setStartModal] = useState(null);
  const [startChecks, setStartChecks] = useState([]);
  const [startLoading, setStartLoading] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [completeSteps, setCompleteSteps] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const poId = poFilter ? Number(poFilter) : undefined;
      const [wRes, sRes] = await Promise.all([
        getWorkOrders(poId).catch(() => ({ data: [] })),
        getWorkOrderSummary(poId).catch(() => ({ data: null })),
      ]);
      const apiRows = wRes.data || [];
      setWorkOrders(apiRows.map((r, i) => enrichApiWorkOrder(r, i)));
      setApiSummary(sRes.data);
    } catch {
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  }, [poFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return workOrders.filter((w) => {
      if (poFilter && String(w.production_order_id) !== poFilter) return false;
      if (filters.work_order_number && !w.work_order_number.toLowerCase().includes(filters.work_order_number.toLowerCase())) return false;
      if (filters.production_order && !String(w.production_order_number || "").toLowerCase().includes(filters.production_order.toLowerCase())) return false;
      if (filters.product && !String(w.product_name || "").toLowerCase().includes(filters.product.toLowerCase())) return false;
      if (filters.customer && !String(w.customer_name || "").toLowerCase().includes(filters.customer.toLowerCase())) return false;
      if (filters.machine && !String(w.machine_name || "").toLowerCase().includes(filters.machine.toLowerCase())) return false;
      if (filters.operator && !String(w.operator_name || "").toLowerCase().includes(filters.operator.toLowerCase())) return false;
      if (filters.department && w.department !== filters.department) return false;
      if (filters.shift && w.shift !== filters.shift) return false;
      if (filters.priority && w.priority !== filters.priority) return false;
      if (filters.status && w.status !== filters.status) return false;
      return true;
    });
  }, [workOrders, filters, poFilter]);

  const summary = useMemo(() => {
    if (apiSummary && !Object.values(filters).some(Boolean) && !poFilter) return apiSummary;
    const computed = computeWorkOrderSummary(filtered);
    if (!apiSummary && filtered.length === DEMO_WORK_ORDERS.length && !Object.values(filters).some(Boolean)) return DEMO_WO_SUMMARY;
    return computed;
  }, [apiSummary, filtered, filters, poFilter]);

  const openWo = async (wo) => {
    setSelected(wo);
    setDetail(null);
    if (typeof wo.id === "number") {
      try {
        const res = await getWorkOrderDetail(wo.id);
        setDetail(enrichApiWorkOrder(res.data));
      } catch { /* list data */ }
    }
  };

  const handleStartClick = async (wo) => {
    if (typeof wo.id === "number") {
      try {
        const res = await getWorkOrderStartChecks(wo.id);
        setStartChecks(res.data || []);
        setStartModal(wo);
        return;
      } catch {
        addToast("Could not load checks", "error");
        return;
      }
    }
    setStartChecks([
      { check_type: "material", label: "Material Issued", ready: true, message: "Materials issued" },
      { check_type: "machine", label: "Machine Ready", ready: !!wo.machine_name, message: wo.machine_name ? "Machine ready" : "No machine" },
      { check_type: "operator", label: "Operator Assigned", ready: !!wo.operator_name, message: wo.operator_name ? "Operator ready" : "No operator" },
    ]);
    setStartModal(wo);
  };

  const confirmStart = async () => {
    const wo = startModal;
    if (!wo) return;
    setStartLoading(true);
    if (typeof wo.id === "number") {
      try {
        const res = await startWorkOrder(wo.id);
        if (res.data?.success) {
          addToast("Work order started");
          load();
          setStartModal(null);
          setSelected(null);
        } else {
          setStartChecks(res.data?.checks || []);
          addToast(res.data?.message || "Start failed", "error");
        }
      } catch {
        addToast("Start failed", "error");
      } finally {
        setStartLoading(false);
      }
      return;
    }
    setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? { ...w, status: "running", machine_status: "running" } : w)));
    addToast("Work order started");
    setStartModal(null);
    setStartLoading(false);
  };

  const handlePause = async (wo) => {
    if (typeof wo.id === "number") {
      try {
        await pauseWorkOrder(wo.id);
        addToast("Paused");
        load();
      } catch { addToast("Pause failed", "error"); }
      return;
    }
    setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? { ...w, status: "paused" } : w)));
    addToast("Paused");
  };

  const handleStop = async (wo) => {
    if (typeof wo.id === "number") {
      try {
        await stopWorkOrder(wo.id);
        addToast("Stopped");
        load();
      } catch { addToast("Stop failed", "error"); }
      return;
    }
    setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? { ...w, status: "planned", machine_status: "idle" } : w)));
    addToast("Stopped");
  };

  const handleComplete = async (wo) => {
    if (typeof wo.id === "number") {
      try {
        const res = await completeWorkOrder(wo.id);
        if (res.data?.success) {
          setCompleteSteps(res.data.steps || []);
          setCompleteModal(wo);
          addToast("Completed");
          load();
          setSelected(null);
        } else {
          addToast(res.data?.message || "Complete failed", "error");
        }
      } catch { addToast("Complete failed", "error"); }
      return;
    }
    setCompleteSteps(["Production finished", "Quality passed", "FG recorded", "WO closed"]);
    setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? { ...w, status: "completed", produced_quantity: w.planned_quantity, progress_pct: 100 } : w)));
    setCompleteModal(wo);
    addToast("Completed");
  };

  const exportCols = [
    { key: "work_order_number", label: "WO No" },
    { key: "product_name", label: "Product" },
    { key: "production_order_number", label: "PO" },
    { key: "customer_name", label: "Customer" },
    { key: "machine_name", label: "Machine" },
    { key: "planned_quantity", label: "Planned" },
    { key: "produced_quantity", label: "Produced" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
  ];

  const columns = [
    { key: "work_order_number", label: "WO No" },
    { key: "product_name", label: "Product" },
    { key: "production_order_number", label: "Production Order" },
    { key: "customer_name", label: "Customer" },
    {
      key: "machine_name",
      label: "Machine",
      render: (r) => <MachineCell row={r} />,
    },
    { key: "operator_name", label: "Operator" },
    { key: "planned_quantity", label: "Planned Qty" },
    {
      key: "progress",
      label: "Produced",
      sortable: false,
      render: (r) => <ProgressCell row={r} />,
    },
    {
      key: "remaining_quantity",
      label: "Remaining",
      render: (r) => r.remaining_quantity ?? Math.max((r.planned_quantity || 0) - (r.produced_quantity || 0), 0),
    },
    {
      key: "priority",
      label: "Priority",
      render: (r) => <PriorityPill priority={r.priority} />,
    },
    {
      key: "planned_start",
      label: "Start",
      render: (r) => formatDate(r.planned_start),
    },
    {
      key: "planned_end",
      label: "Due",
      render: (r) => formatDate(r.planned_end),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span className="inline-flex flex-col gap-0.5">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize">{woStatusLabel(r.status)}</span>
          {r.is_delayed && <span className="text-[10px] font-semibold text-red-600">🔴 Delayed</span>}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1 text-xs">
          <button type="button" onClick={() => openWo(r)} className="font-semibold text-[#2563EB] hover:underline">👁 View</button>
          <Link to={`/production/planning`} className="font-semibold text-slate-600 hover:underline">✏ Edit</Link>
          {canWoStart(r.status) && <button type="button" onClick={() => handleStartClick(r)} className="font-semibold text-green-700 hover:underline">▶ Start</button>}
          {canWoPause(r.status) && <button type="button" onClick={() => handlePause(r)} className="font-semibold text-amber-700 hover:underline">⏸ Pause</button>}
          {canWoStop(r.status) && <button type="button" onClick={() => handleStop(r)} className="font-semibold text-slate-600 hover:underline">⏹ Stop</button>}
          {canWoComplete(r.status) && <button type="button" onClick={() => handleComplete(r)} className="font-semibold text-teal-700 hover:underline">✅ Complete</button>}
          <button type="button" onClick={() => window.print()} className="font-semibold text-slate-500 hover:underline">🖨 Print</button>
          <button type="button" onClick={() => exportToPdf([r], exportCols, `WO ${r.work_order_number}`, r.work_order_number)} className="font-semibold text-slate-500 hover:underline">📄 PDF</button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader label="Loading work orders..." />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            <Link to="/production/planning" className="hover:text-[#2563EB]">Production Planning</Link> → Work Orders
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Who, which machine, when, and how — shop floor execution from planning to finished goods.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/production/work-orders/create-quick" className="ui-btn-primary">
            <Plus className="h-4 w-4" /> New Work Order
          </Link>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Work Orders" value={summary.total_work_orders} icon={ClipboardList} color="bg-[#2563EB]" />
        <SummaryCard label="Planned" value={summary.planned_orders} icon={FileText} color="bg-blue-500" />
        <SummaryCard label="In Progress" value={summary.in_progress_orders} icon={Play} color="bg-amber-500" />
        <SummaryCard label="Completed" value={summary.completed_orders} icon={CheckCircle2} color="bg-green-500" />
        <SummaryCard label="Delayed" value={summary.delayed_orders} icon={AlertTriangle} color="bg-red-500" />
        <SummaryCard label="High Priority" value={summary.high_priority_orders} icon={Star} color="bg-purple-500" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Search work orders..."
            value={filters.work_order_number}
            onChange={(e) => setFilters((f) => ({ ...f, work_order_number: e.target.value }))}
            className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-600">
            {showAdvanced ? "Hide Filters" : "Advanced Filters"}
          </button>
          <button type="button" onClick={() => exportToExcel(filtered, exportCols, "work-orders")} className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-600">
            <Download className="inline h-4 w-4" /> Export
          </button>
        </div>

        {showAdvanced && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <input placeholder="WO Number" value={filters.work_order_number} onChange={(e) => setFilters((f) => ({ ...f, work_order_number: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Production Order" value={filters.production_order} onChange={(e) => setFilters((f) => ({ ...f, production_order: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Product" value={filters.product} onChange={(e) => setFilters((f) => ({ ...f, product: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Customer" value={filters.customer} onChange={(e) => setFilters((f) => ({ ...f, customer: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Machine" value={filters.machine} onChange={(e) => setFilters((f) => ({ ...f, machine: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Operator" value={filters.operator} onChange={(e) => setFilters((f) => ({ ...f, operator: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <select value={filters.department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.shift} onChange={(e) => setFilters((f) => ({ ...f, shift: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Shift</option>
              {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Priority</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Status</option>
              {WO_STATUSES.map((s) => <option key={s} value={s}>{woStatusLabel(s)}</option>)}
            </select>
            <button type="button" onClick={() => setFilters(defaultFilters)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Clear</button>
          </div>
        )}

        <DataTable columns={columns} data={filtered} showSearch={false} emptyState={
          <div className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-600">No work orders found.</p>
            <Link to="/production/work-orders/create-quick" className="ui-btn-primary mt-4 inline-flex">Create Work Order</Link>
          </div>
        } />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-50 px-4 py-3">
        {WORKFLOW_STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-[#2563EB]">{step}</span>
            {i < WORKFLOW_STEPS.length - 1 && <span className="text-slate-300">→</span>}
          </span>
        ))}
      </div>

      <div className="rounded-xl border bg-white px-4 py-3">
        <p className="mb-2 text-xs font-semibold text-slate-500">Status Workflow</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s, i) => (
            <span key={s} className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{s}</span>
              {i < STATUS_FLOW.length - 1 && <span className="text-slate-300">↓</span>}
            </span>
          ))}
        </div>
      </div>

      {selected && (
        <WorkOrderDetailModal
          workOrder={selected}
          detail={detail}
          onClose={() => { setSelected(null); setDetail(null); }}
          onStart={handleStartClick}
          onPause={handlePause}
          onStop={handleStop}
          onComplete={handleComplete}
        />
      )}

      {startModal && (
        <WorkOrderStartModal workOrder={startModal} checks={startChecks} onClose={() => setStartModal(null)} onConfirm={confirmStart} loading={startLoading} />
      )}

      {completeModal && (
        <WorkOrderCompleteModal workOrder={completeModal} steps={completeSteps} onClose={() => setCompleteModal(null)} />
      )}
    </div>
  );
}
