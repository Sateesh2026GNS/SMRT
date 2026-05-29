import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Play,
  Square,
  ClipboardList,
  Package,
  Cpu,
  ArrowRight,
} from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { SearchBar, FilterSelect } from "../../components/common/SearchFilter";
import SkeletonTable from "../../components/common/SkeletonTable";
import { StatusBadge } from "../../components/common/Table";
import {
  getWorkOrders,
  getMachines,
  getProductionOrders,
  getProducts,
  updateWorkOrder,
  updateMachineStatus,
} from "../../api/productionApi";

const TENANT_ID = 1;

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const cardSkeleton = (
  <div className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5">
    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
    <div className="mt-2 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
  </div>
);

export default function ProductionDashboard({ title = "Production Dashboard" }) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingQty, setEditingQty] = useState("");
  const [assigningMachineId, setAssigningMachineId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const productMap = useMemo(() => {
    const m = {};
    products.forEach((p) => { m[p.id] = p.name; });
    return m;
  }, [products]);

  const prodOrderMap = useMemo(() => {
    const m = {};
    productionOrders.forEach((po) => {
      m[po.id] = { product_id: po.product_id, order_number: po.order_number };
    });
    return m;
  }, [productionOrders]);

  const machineMap = useMemo(() => {
    const m = {};
    machines.forEach((ma) => { m[ma.id] = ma.name; });
    return m;
  }, [machines]);

  const enrichedOrders = useMemo(() => {
    return workOrders.map((wo) => {
      const po = prodOrderMap[wo.production_order_id];
      const productName = po ? productMap[po.product_id] : "—";
      return {
        ...wo,
        product_name: productName,
        machine_name: wo.machine_id ? machineMap[wo.machine_id] : "—",
      };
    });
  }, [workOrders, prodOrderMap, productMap, machineMap]);

  const filtered = useMemo(() => {
    let r = enrichedOrders;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (wo) =>
          wo.work_order_number?.toLowerCase().includes(q) ||
          wo.product_name?.toLowerCase().includes(q) ||
          wo.machine_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) r = r.filter((wo) => wo.status === statusFilter);
    return r;
  }, [enrichedOrders, search, statusFilter]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [woRes, mRes, poRes, pRes] = await Promise.all([
          getWorkOrders(TENANT_ID),
          getMachines(TENANT_ID),
          getProductionOrders(TENANT_ID),
          getProducts(TENANT_ID),
        ]);
        setWorkOrders(woRes.data || []);
        setMachines(mRes.data || []);
        setProductionOrders(poRes.data || []);
        setProducts(pRes.data || []);
      } catch (e) {
        console.error(e);
        addToast("Failed to load production data", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const total = workOrders.length;
  const inProgress = workOrders.filter((w) =>
    ["in_progress", "planned"].includes(w.status)
  ).length;
  const completed = workOrders.filter((w) => w.status === "completed").length;

  const handleInlineSave = async (wo) => {
    const qty = parseFloat(editingQty);
    if (isNaN(qty) || qty < 0) return;
    setActionLoading(wo.id);
    try {
      await updateWorkOrder(wo.id, TENANT_ID, { actual_quantity: qty });
      setWorkOrders((prev) =>
        prev.map((w) => (w.id === wo.id ? { ...w, actual_quantity: qty } : w))
      );
      addToast("Quantity updated successfully");
      setEditingId(null);
    } catch (e) {
      addToast("Failed to update quantity", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignMachine = async (wo, machineId) => {
    if (!machineId) return;
    setAssigningMachineId(wo.id);
    try {
      await updateWorkOrder(wo.id, TENANT_ID, { machine_id: Number(machineId) });
      setWorkOrders((prev) =>
        prev.map((w) => (w.id === wo.id ? { ...w, machine_id: Number(machineId) } : w))
      );
      addToast("Machine assigned successfully");
    } catch (e) {
      addToast("Failed to assign machine", "error");
    } finally {
      setAssigningMachineId(null);
    }
  };

  const handleMachineAction = async (machine, newStatus) => {
    setActionLoading(`m-${machine.id}`);
    try {
      await updateMachineStatus(machine.id, TENANT_ID, newStatus);
      setMachines((prev) =>
        prev.map((m) => (m.id === machine.id ? { ...m, status: newStatus } : m))
      );
      addToast(`Machine ${newStatus === "running" ? "started" : "stopped"} successfully`);
    } catch (e) {
      addToast("Failed to update machine status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    const today = new Date();
    return dt.toDateString() === today.toDateString()
      ? "Today"
      : dt.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {cardSkeleton}
          {cardSkeleton}
          {cardSkeleton}
        </div>
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title + Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {title === "Production Dashboard" && (
            <>
              <Link
                to="/factory-monitor/live-production"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                Live Production
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/factory-monitor/machine-status"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                Machine Status
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
          <Link
            to="/production/work-orders/create-quick"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Create Work Order
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Orders
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {total}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            In Progress
          </p>
          <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {inProgress}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Completed
          </p>
          <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {completed}
          </p>
        </div>
      </div>

      {/* Main content: Table + Machine Panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search work orders..."
              />
              <FilterSelect
                label="Status"
                value={statusFilter}
                options={statusOptions}
                onChange={setStatusFilter}
                placeholder="All"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {filtered.length} results
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500">Work Order</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500">Machine</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500">Qty</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filtered.map((wo) => (
                    <tr
                      key={wo.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {wo.work_order_number}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {wo.product_name}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {!wo.machine_id && ["planned", "pending"].includes(wo.status) ? (
                          <select
                            onChange={(e) => handleAssignMachine(wo, e.target.value)}
                            disabled={assigningMachineId === wo.id}
                            className="rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm min-w-[120px]"
                          >
                            <option value="">Assign machine...</option>
                            {machines.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        ) : (
                          wo.machine_name
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={wo.status} />
                      </td>
                      <td className="py-3 px-4">
                        {editingId === wo.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingQty}
                              onChange={(e) => setEditingQty(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleInlineSave(wo);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="w-20 rounded-lg border border-slate-200 dark:border-slate-600 px-2 py-1 text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleInlineSave(wo)}
                              disabled={actionLoading === wo.id}
                              className="rounded bg-teal-600 px-2 py-1 text-xs text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(wo.id);
                              setEditingQty(String(wo.actual_quantity ?? wo.planned_quantity ?? ""));
                            }}
                            className="text-left hover:underline text-slate-700 dark:text-slate-300"
                          >
                            {wo.actual_quantity ?? wo.planned_quantity ?? "—"}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                        {formatDate(wo.planned_start || wo.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No work orders found. Create one to get started.
              </div>
            )}
          </div>
        </div>

        {/* Machine Status Panel */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-teal-500" />
              Machine Status
            </h3>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Live
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 p-2">
            {machines.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No machines configured
              </div>
            ) : (
              machines.map((m) => {
                const dot =
                  m.status === "running"
                    ? "bg-emerald-500"
                    : m.status === "down" || m.status === "stopped"
                    ? "bg-red-500"
                    : "bg-amber-500";
                const loading = actionLoading === `m-${m.id}`;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {m.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {m.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {m.status !== "running" && (
                        <button
                          onClick={() => handleMachineAction(m, "running")}
                          disabled={loading}
                          className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 disabled:opacity-50"
                          title="Start"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {m.status === "running" && (
                        <button
                          onClick={() => handleMachineAction(m, "stopped")}
                          disabled={loading}
                          className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50"
                          title="Stop"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
