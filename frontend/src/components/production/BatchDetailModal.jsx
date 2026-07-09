import { X } from "lucide-react";

import { BATCH_TRACE_STEPS } from "../../data/batchTrackingMasterData";

function TraceStep({ step, status, detail, timestamp, isLast }) {
  const done = status === "completed" || status === "passed";
  const active = status === "running";
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${done ? "bg-green-500" : active ? "bg-blue-500" : "bg-slate-300"}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200" />}
      </div>
      <div className="pb-4">
        <p className="text-sm font-semibold text-slate-800">{step}</p>
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
        {timestamp && (
          <p className="text-[10px] text-slate-400">
            {new Date(timestamp).toLocaleString()}
          </p>
        )}
        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
          done ? "bg-green-100 text-green-800" : active ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default function BatchDetailModal({ batch, onClose }) {
  if (!batch) return null;

  const trace = batch.traceability?.length
    ? batch.traceability
    : BATCH_TRACE_STEPS.map((s) => ({ step: s, status: "pending", detail: null, timestamp: null }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{batch.batch_code}</h2>
            <p className="text-sm text-slate-500">{batch.product_name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Batch No", batch.batch_code],
              ["Product", batch.product_name],
              ["Customer", batch.customer_name || "—"],
              ["Production Order", batch.production_order_number || "—"],
              ["Work Order", batch.work_order_number || "—"],
              ["Machine", batch.machine_name || "—"],
              ["Operator", batch.operator_name || "—"],
              ["Shift", batch.shift || "—"],
              ["Material Lot", batch.material_lot || "—"],
              ["QC Status", batch.qc_status || "—"],
              ["Dispatch", batch.dispatch_status || "—"],
              ["Invoice", batch.invoice_number || "—"],
              ["Quantity", batch.quantity],
              ["Good Qty", batch.good_qty],
              ["Scrap", batch.scrap_qty],
              ["Status", batch.status],
            ].map(([label, val]) => (
              <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-medium text-slate-500">{label}</p>
                <p className="text-sm font-semibold capitalize text-slate-800">{val}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-slate-800">Complete Traceability</h3>
            <div className="pl-1">
              {trace.map((t, i) => (
                <TraceStep
                  key={t.step}
                  step={t.step}
                  status={t.status}
                  detail={t.detail}
                  timestamp={t.timestamp}
                  isLast={i === trace.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
