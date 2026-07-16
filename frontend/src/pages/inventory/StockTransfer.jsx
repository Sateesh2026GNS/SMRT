import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, RefreshCw, Truck } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { createStockTransfer, getInventoryDashboard, getStockTransfers, getWarehouses } from "../../api/inventoryApi";
import { DEMO_TRANSFERS, TRANSFER_STATUSES } from "../../data/inventoryMasterData";
import useTenantId from "../../hooks/useTenantId";

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700",
  pending_approval: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  received: "bg-teal-100 text-teal-800",
  completed: "bg-green-100 text-green-800",
};

export default function StockTransfer() {
  const tenantId = useTenantId();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState(DEMO_TRANSFERS);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ from_warehouse_id: "", to_warehouse_id: "", item_id: "", batch_number: "", quantity: "", vehicle: "", driver: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [trRes, whRes, itemsRes] = await Promise.allSettled([
        getStockTransfers(), getWarehouses(), getInventoryDashboard(),
      ]);
      if (trRes.status === "fulfilled" && trRes.value?.data?.length) setTransfers(trRes.value.data);
      if (whRes.status === "fulfilled") setWarehouses(whRes.value?.data || []);
      if (itemsRes.status === "fulfilled") setItems(itemsRes.value?.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.from_warehouse_id === form.to_warehouse_id) { addToast("Warehouses must differ", "error"); return; }
    setSubmitting(true);
    try {
      await createStockTransfer({
        from_warehouse_id: Number(form.from_warehouse_id),
        to_warehouse_id: Number(form.to_warehouse_id),
        item_id: Number(form.item_id),
        batch_number: form.batch_number || null,
        quantity: Number(form.quantity),
        vehicle: form.vehicle || null,
        driver: form.driver || null,
        notes: form.notes || null,
      });
      addToast("Transfer created — pending approval");
      setForm({ from_warehouse_id: "", to_warehouse_id: "", item_id: "", batch_number: "", quantity: "", vehicle: "", driver: "", notes: "" });
      load();
    } catch { addToast("Transfer failed", "error"); }
    finally { setSubmitting(false); }
  };

  const historyColumns = [
    { key: "transfer_number", label: "Transfer No" },
    { key: "transfer_date", label: "Date" },
    { key: "from_warehouse", label: "From" },
    { key: "to_warehouse", label: "To" },
    { key: "item_name", label: "Item" },
    { key: "quantity", label: "Qty" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[r.status] || "bg-slate-100"}`}>{r.status?.replace(/_/g, " ")}</span> },
    { key: "approved_by", label: "Approved By", render: (r) => r.approved_by || "—" },
  ];

  if (loading) return <Loader label="Loading stock transfers..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header><h1 className="text-2xl font-bold text-slate-900">Stock Transfer</h1><p className="mt-1 text-sm text-slate-500">Create inter-warehouse transfers with approval workflow.</p></header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><Plus className="h-4 w-4" /> Create Transfer</h2>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">From Warehouse<select value={form.from_warehouse_id} onChange={(e) => setForm((f) => ({ ...f, from_warehouse_id: e.target.value }))} required className="mt-1 w-full rounded-lg border px-3 py-2"><option value="">Select</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
            <label className="text-sm">To Warehouse<select value={form.to_warehouse_id} onChange={(e) => setForm((f) => ({ ...f, to_warehouse_id: e.target.value }))} required className="mt-1 w-full rounded-lg border px-3 py-2"><option value="">Select</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
            <label className="text-sm sm:col-span-2">Item<select value={form.item_id} onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))} required className="mt-1 w-full rounded-lg border px-3 py-2"><option value="">Select</option>{items.map((i) => <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>)}</select></label>
            <label className="text-sm">Batch<input value={form.batch_number} onChange={(e) => setForm((f) => ({ ...f, batch_number: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-sm">Qty<input type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} required className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-sm">Vehicle<input value={form.vehicle} onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-sm">Driver<input value={form.driver} onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-sm sm:col-span-2">Notes<textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" rows={2} /></label>
            <button type="submit" disabled={submitting} className="ui-btn-primary sm:col-span-2">{submitting ? "Creating..." : "Create Transfer"}</button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Status Flow</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            {TRANSFER_STATUSES.map((s, i) => (
              <span key={s} className="flex items-center gap-2"><span className="rounded-full bg-white px-2 py-1 capitalize shadow-sm">{s.replace(/_/g, " ")}</span>{i < TRANSFER_STATUSES.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400" />}</span>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Truck className="h-4 w-4" /> Transfer History</h2>
          <button type="button" onClick={load} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw className="inline h-3 w-3" /> Refresh</button>
        </div>
        <DataTable columns={historyColumns} data={transfers.length ? transfers : DEMO_TRANSFERS} showSearch={false} />
      </section>
    </div>
  );
}
