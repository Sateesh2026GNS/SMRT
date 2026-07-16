import { Link } from "react-router-dom";
import { X } from "lucide-react";

import { formatInr, statusColor } from "../../data/salesMasterData";

export default function SODetailModal({ order, onClose }) {
  if (!order) return null;
  const items = order.items || [
    { name: "Industrial Pump 5HP", qty: 10, rate: 18500 },
    { name: "Control Panel Unit", qty: 5, rate: 12000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-[#2563EB]">{order.order_number}</p>
            <h2 className="text-xl font-bold text-slate-900">{order.customer_name}</h2>
            <p className="text-sm text-slate-500">{String(order.order_date || "").slice(0, 10)} · {order.sales_person || "—"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Field label="Delivery Date" value={order.delivery_date || "—"} />
            <Field label="Payment" value={order.payment_terms || "Net 30"} />
            <Field label="Warehouse" value={order.warehouse_name || "—"} />
            <Field label="Status"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(order.status)}`}>{order.status}</span></Field>
          </div>
          <table className="mb-4 w-full text-left text-sm">
            <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="py-2">Product</th><th>Qty</th><th>Rate</th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b"><td className="py-2">{it.name}</td><td>{it.qty}</td><td>{formatInr(it.rate)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-lg font-bold">{formatInr(order.amount)}</p>
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Workflow: Quotation → Sales Order → Packing → Dispatch → Invoice → Payment
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span className={order.packed ? "text-green-600" : "text-slate-400"}>Packed {order.packed ? "✓" : "○"}</span>
            <span className={order.shipped ? "text-green-600" : "text-slate-400"}>Shipped {order.shipped ? "✓" : "○"}</span>
            <span className={order.invoiced ? "text-green-600" : "text-slate-400"}>Invoiced {order.invoiced ? "✓" : "○"}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t px-5 py-4">
          {typeof order.id === "number" && (
            <Link to={`/sales/orders/${order.id}`} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700">Full Details</Link>
          )}
          <Link to="/sales/dispatch" className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Go to Dispatch</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, children }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      {children || <p className="mt-0.5 text-sm font-medium text-slate-800">{value ?? "—"}</p>}
    </div>
  );
}
