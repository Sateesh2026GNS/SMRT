import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Package, Plus, RefreshCw, X } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getGRNEnriched, getGRNSummary } from "../../api/procurementApi";
import { DEMO_GRN_LIST, DEMO_GRN_SUMMARY, formatInr, statusColor } from "../../data/procurementMasterData";

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

function WorkflowStrip() {
  const steps = ["Purchase Order", "Goods Received", "QC Inspection", "Accepted", "Inventory Updated"];
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

function GRNDetailModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{row.grn_number}</h2>
            <p className="text-sm text-slate-500">PO: {row.po_number} · {row.vendor_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-400">Warehouse</p><p className="font-medium">{row.warehouse_name || "—"}</p></div>
          <div><p className="text-xs text-slate-400">Quantity</p><p className="font-medium">{row.quantity}</p></div>
          <div><p className="text-xs text-slate-400">QC Status</p><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(row.qc_status)}`}>{row.qc_status}</span></div>
          <div><p className="text-xs text-slate-400">Received By</p><p className="font-medium">{row.received_by || "—"}</p></div>
        </div>
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          After GRN: Raw Material Inventory automatically increased · Stock Ledger entry created
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700">Close</button>
      </div>
    </div>
  );
}

export default function GoodsReceipt() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_GRN_SUMMARY);
  const [rows, setRows] = useState(DEMO_GRN_LIST);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getGRNSummary(), getGRNEnriched()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_GRN_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setRows(listRes.value.data);
      else setRows(DEMO_GRN_LIST);
    } catch {
      addToast("Using demo GRN data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const qcColor = (qc) => {
    const m = { passed: "bg-green-100 text-green-800", pending: "bg-amber-100 text-amber-800", rejected: "bg-red-100 text-red-800" };
    return m[qc] || m.pending;
  };

  const columns = [
    { key: "grn_number", label: "GRN" },
    { key: "po_number", label: "PO" },
    { key: "vendor_name", label: "Vendor" },
    { key: "warehouse_name", label: "Warehouse" },
    { key: "quantity", label: "Qty" },
    { key: "qc_status", label: "QC", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${qcColor(r.qc_status)}`}>{r.qc_status || "pending"}</span> },
    { key: "received_by", label: "Received By" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <button type="button" onClick={() => setSelected(r)} className="text-xs font-semibold text-[#2563EB] hover:underline">View</button>
    )},
  ];

  if (loading) return <Loader label="Loading goods receipts..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goods Receipt Note (GRN)</h1>
          <p className="mt-1 text-sm text-slate-500">Receive goods against PO with QC inspection and automatic inventory update.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/procurement/goods-receipt/create" className="ui-btn-primary"><Plus className="h-4 w-4" /> New GRN</Link>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Today's GRN" value={summary.todays_grn} icon={Package} color="bg-blue-600" />
        <KpiCard label="Pending QC" value={summary.pending_qc} icon={Package} color="bg-amber-500" />
        <KpiCard label="Received" value={summary.received} icon={CheckCircle} color="bg-green-600" />
        <KpiCard label="Rejected" value={summary.rejected} icon={Package} color="bg-red-500" />
        <KpiCard label="Total Value" value={formatInr(summary.total_value)} icon={Package} color="bg-indigo-600" />
      </div>

      <WorkflowStrip />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DataTable columns={columns} data={rows} searchPlaceholder="Search GRN, PO, vendor..." searchKeys={["grn_number", "po_number", "vendor_name"]} />
      </div>

      {selected && <GRNDetailModal row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
