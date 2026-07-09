import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Package, RefreshCw, Truck, X } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getDispatchEnriched, getDispatchSummary } from "../../api/dispatchApi";
import { updateSalesOrderDispatch } from "../../api/salesApi";
import { DEMO_DISPATCH_LIST, DEMO_DISPATCH_SUMMARY, statusColor } from "../../data/salesMasterData";

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

function TrackingModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{row.dispatch_number}</h2>
            <p className="text-sm text-slate-500">{row.so_number} · {row.customer_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Field label="Courier" value={row.courier} />
          <Field label="Vehicle" value={row.vehicle_number} />
          <Field label="Driver" value={row.driver_name} />
          <Field label="LR Number" value={row.lr_number} />
          <Field label="Dispatch Date" value={row.dispatch_date} />
          <Field label="ETA" value={row.eta} />
        </div>
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <MapPin className="mb-1 inline h-4 w-4" /> GPS Tracking: Vehicle {row.vehicle_number} — {row.status === "in_transit" ? "En route" : row.status}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700">Print Delivery Challan</button>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700">Shipping Label</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function Dispatch() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_DISPATCH_SUMMARY);
  const [rows, setRows] = useState(DEMO_DISPATCH_LIST);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getDispatchSummary(), getDispatchEnriched()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_DISPATCH_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setRows(listRes.value.data);
      else setRows(DEMO_DISPATCH_LIST);
    } catch {
      addToast("Using demo dispatch data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const handleShip = async (row) => {
    if (typeof row.id === "number") {
      try {
        await updateSalesOrderDispatch(row.id, { shipped: true });
        addToast("Marked as shipped");
        load();
      } catch (err) {
        addToast(err.response?.data?.detail || "Update failed", "error");
      }
    } else {
      addToast("Shipment tracked (demo)");
    }
  };

  const columns = [
    { key: "dispatch_number", label: "Dispatch No" },
    { key: "so_number", label: "SO No" },
    { key: "customer_name", label: "Customer" },
    { key: "courier", label: "Courier" },
    { key: "vehicle_number", label: "Vehicle" },
    { key: "driver_name", label: "Driver" },
    { key: "dispatch_date", label: "Dispatch Date", render: (r) => String(r.dispatch_date || "").slice(0, 10) },
    { key: "eta", label: "ETA", render: (r) => r.eta || "—" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => setSelected(r)} className="text-xs font-semibold text-[#2563EB] hover:underline">Track</button>
        {r.status === "packed" && (
          <button type="button" onClick={() => handleShip(r)} className="text-xs text-teal-600 hover:underline">Ship</button>
        )}
      </div>
    )},
  ];

  if (loading) return <Loader label="Loading dispatch..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispatch & Logistics</h1>
          <p className="mt-1 text-sm text-slate-500">Shipment tracking, packing slips, delivery challans, and courier management.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/sales/orders" className="ui-btn-primary"><Truck className="h-4 w-4" /> View Sales Orders</Link>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Ready to Dispatch" value={summary.ready_to_dispatch} icon={Package} color="bg-amber-500" />
        <KpiCard label="Packed" value={summary.packed} icon={Package} color="bg-indigo-600" />
        <KpiCard label="In Transit" value={summary.in_transit} icon={Truck} color="bg-cyan-600" />
        <KpiCard label="Delivered" value={summary.delivered} icon={Truck} color="bg-green-600" />
        <KpiCard label="Delayed" value={summary.delayed} icon={Truck} color="bg-red-500" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
        {["Quotation", "Sales Order", "Packing", "Dispatch", "Invoice", "Payment"].map((s, i, arr) => (
          <span key={s} className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-2 py-1 shadow-sm">{s}</span>
            {i < arr.length - 1 && <span className="text-slate-400">↓</span>}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DataTable columns={columns} data={rows} searchPlaceholder="Search dispatch, SO, customer..." searchKeys={["dispatch_number", "so_number", "customer_name", "courier"]} />
      </div>

      {selected && <TrackingModal row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
