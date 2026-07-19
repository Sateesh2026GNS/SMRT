import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, FileSearch, RefreshCw, Star, Trophy } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getRFQComparison, getRFQList, getRFQSummary } from "../../api/procurementApi";
import {
  DEMO_RFQ_LIST,
  DEMO_RFQ_SUMMARY,
  DEMO_VENDOR_COMPARISON,
  statusColor,
} from "../../data/procurementMasterData";

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
  const steps = ["Material Request", "RFQ", "Multiple Vendors", "Quotation Comparison", "Purchase Order"];
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

function VendorComparisonPanel({ vendors, bestVendor }) {
  if (!vendors?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Vendor Comparison</h2>
        {bestVendor && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Trophy className="h-3.5 w-3.5" /> Best: {bestVendor.supplier_name}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-slate-500">
              <th className="py-2 pr-4">Vendor</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Delivery</th>
              <th className="py-2 pr-4">GST</th>
              <th className="py-2 pr-4">Warranty</th>
              <th className="py-2 pr-4">Rating</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.supplier_id} className={`border-b ${v.is_best ? "bg-emerald-50" : ""}`}>
                <td className="py-3 pr-4 font-medium">{v.supplier_name}{v.is_best && <Star className="ml-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />}</td>
                <td className="py-3 pr-4">₹{Number(v.price).toLocaleString("en-IN")}</td>
                <td className="py-3 pr-4">{v.delivery_days} days</td>
                <td className="py-3 pr-4">{v.gst_pct}%</td>
                <td className="py-3 pr-4">{v.warranty}</td>
                <td className="py-3 pr-4">{v.rating}</td>
                <td className="py-3 font-bold">{v.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        <Link to="/procurement/purchase-orders/create" className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Create PO from Best Vendor</Link>
      </div>
    </div>
  );
}

export default function RFQ() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_RFQ_SUMMARY);
  const [rows, setRows] = useState([]);
  const [comparison, setComparison] = useState(DEMO_VENDOR_COMPARISON);
  const [selectedRfq, setSelectedRfq] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getRFQSummary(), getRFQList()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_RFQ_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) {
        setRows(listRes.value.data);
        setSelectedRfq(listRes.value.data[0]);
      } else {
        setRows([]);
        setSelectedRfq([]);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedRfq?.id) return;
    const rfqId = typeof selectedRfq.id === "number" ? selectedRfq.id : 1;
    getRFQComparison(rfqId)
      .then((res) => { if (res.data?.length) setComparison(res.data); })
      .catch(() => setComparison([]));
  }, [selectedRfq]);

  const bestVendor = comparison.find((v) => v.is_best) || comparison[0];

  const columns = [
    { key: "rfq_number", label: "RFQ No" },
    { key: "material_request_number", label: "Material Request" },
    { key: "vendor_count", label: "Vendors" },
    { key: "due_date", label: "Due Date", render: (r) => String(r.due_date || "").slice(0, 10) },
    { key: "quotation_count", label: "Quotations" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <button type="button" onClick={() => setSelectedRfq(r)} className="text-xs font-semibold text-[#2563EB] hover:underline">Compare</button>
    )},
  ];

  if (loading) return <Loader label="Loading RFQs..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Request for Quotation (RFQ)</h1>
          <p className="mt-1 text-sm text-slate-500">Send RFQs to multiple vendors and automatically compare quotations.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open RFQs" value={summary.open_rfqs} icon={FileSearch} color="bg-blue-600" />
        <KpiCard label="Vendor Responses" value={summary.vendor_responses} icon={FileSearch} color="bg-indigo-600" />
        <KpiCard label="Expired RFQs" value={summary.expired_rfqs} icon={FileSearch} color="bg-slate-500" />
        <KpiCard label="Awarded RFQs" value={summary.awarded_rfqs} icon={Award} color="bg-emerald-600" />
      </div>

      <WorkflowStrip />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <DataTable columns={columns} data={rows} searchPlaceholder="Search RFQ..." searchKeys={["rfq_number", "material_request_number", "status"]} />
      </div>

      <VendorComparisonPanel vendors={comparison} bestVendor={bestVendor} />
    </div>
  );
}
