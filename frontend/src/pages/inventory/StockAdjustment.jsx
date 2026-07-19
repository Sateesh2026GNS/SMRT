import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, Plus, RefreshCw } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { createStockAdjustment, getInventoryDashboard, getStockAdjustments, getWarehouses } from "../../api/inventoryApi";
import { ADJUSTMENT_REASONS, DEMO_ADJUSTMENTS } from "../../data/inventoryMasterData";

const APPROVAL_FLOW = ["Store Executive", "Store Manager", "Inventory Manager"];

export default function StockAdjustment() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ warehouse_id: "", item_id: "", new_qty: "", reason: "Physical Count" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [adjRes, whRes, itemsRes] = await Promise.allSettled([
        getStockAdjustments(), getWarehouses(), getInventoryDashboard(),
      ]);
      if (adjRes.status === "fulfilled" && adjRes.value?.data?.length) setAdjustments(adjRes.value.data);
      if (whRes.status === "fulfilled") setWarehouses(whRes.value?.data || []);
      if (itemsRes.status === "fulfilled") setItems(itemsRes.value?.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createStockAdjustment({
        warehouse_id: Number(form.warehouse_id),
        item_id: Number(form.item_id),
        new_qty: Number(form.new_qty),
        reason: form.reason,
      });
      addToast("Adjustment recorded — pending approval");
      setForm({ warehouse_id: "", item_id: "", new_qty: "", reason: "Physical Count" });
      load();
    } catch { addToast("Adjustment failed", "error"); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: "adjustment_date", label: "Date" },
    { key: "warehouse_name", label: "Warehouse" },
    { key: "item_name", label: "Item" },
    { key: "old_qty", label: "Old Qty" },
    { key: "new_qty", label: "New Qty" },
    { key: "difference", label: "Difference", render: (r) => <span className={r.difference < 0 ? "text-red-600" : "text-green-600"}>{r.difference > 0 ? `+${r.difference}` : r.difference}</span> },
    { key: "reason", label: "Reason" },
    { key: "approved_by", label: "Approved By", render: (r) => r.approved_by || "Pending" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${r.status === "approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{r.status}</span> },
  ];

  if (loading) return <Loader label="Loading adjustments..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header><h1 className="text-2xl font-bold text-slate-900">Stock Adjustment</h1><p className="mt-1 text-sm text-slate-500">Audit-ready stock corrections with multi-level approval workflow.</p></header>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold"><Plus className="h-4 w-4" /> New Adjustment</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm">Warehouse<select value={form.warehouse_id} onChange={(e) => setForm((f) => ({ ...f, warehouse_id: e.target.value }))} required className="mt-1 w-full rounded-lg border px-3 py-2"><option value="">Select</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
            <label className="block text-sm">Item<select value={form.item_id} onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))} required className="mt-1 w-full rounded-lg border px-3 py-2"><option value="">Select</option>{items.map((i) => <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>)}</select></label>
            <label className="block text-sm">New Quantity<input type="number" min="0" value={form.new_qty} onChange={(e) => setForm((f) => ({ ...f, new_qty: e.target.value }))} required className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <label className="block text-sm">Reason<select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2">{ADJUSTMENT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
            <button type="submit" disabled={submitting} className="ui-btn-primary w-full">{submitting ? "Saving..." : "Record Adjustment"}</button>
          </form>
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700"><ClipboardCheck className="h-3.5 w-3.5" /> Approval Workflow</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">{APPROVAL_FLOW.map((s, i) => <span key={s} className="flex items-center gap-1"><span className="font-semibold text-[#2563EB]">{s}</span>{i < 2 && "→"}</span>)}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex justify-between"><h2 className="text-sm font-bold text-slate-800">Adjustment History</h2><button type="button" onClick={load} className="text-xs font-semibold text-slate-600"><RefreshCw className="inline h-3 w-3" /> Refresh</button></div>
          <DataTable columns={columns} data={adjustments.length ? adjustments : DEMO_ADJUSTMENTS} showSearch={false} />
        </section>
      </div>
    </div>
  );
}
