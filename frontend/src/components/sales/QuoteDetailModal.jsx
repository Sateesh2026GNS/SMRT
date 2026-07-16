import { Link } from "react-router-dom";
import { Download, Mail, Printer, X } from "lucide-react";

import { formatInr, statusColor } from "../../data/salesMasterData";

export default function QuoteDetailModal({ quote, onClose, onStatusChange }) {
  if (!quote) return null;
  const items = quote.items || [
    { name: "Industrial Pump 5HP", qty: 10, rate: 18500, amount: 185000 },
    { name: "Control Panel Unit", qty: 5, rate: 12000, amount: 60000 },
  ];
  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const discount = quote.discount ?? subtotal * 0.05;
  const gst = quote.gst_amount ?? (subtotal - discount) * 0.18;
  const freight = quote.freight ?? 5000;
  const total = quote.amount ?? subtotal - discount + gst + freight;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-[#2563EB]">{quote.quote_number}</p>
            <h2 className="text-xl font-bold text-slate-900">{quote.customer_name}</h2>
            <p className="text-sm text-slate-500">Sales Person: {quote.sales_person || "—"} · Valid until {quote.valid_until || "—"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <table className="mb-4 w-full text-left text-sm">
            <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="py-2">Product</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b"><td className="py-2">{it.name}</td><td>{it.qty}</td><td>{formatInr(it.rate)}</td><td>{formatInr(it.amount)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatInr(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>-{formatInr(discount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span>{formatInr(gst)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Freight</span><span>{formatInr(freight)}</span></div>
            <div className="flex justify-between border-t pt-2 font-bold"><span>Grand Total</span><span>{formatInr(total)}</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(quote.status)}`}>{quote.status}</span>
          </div>
          <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Approval: Sales Executive → Manager Approval → Customer → Accepted
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t px-5 py-4">
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700"><Printer className="h-4 w-4" /> Preview</button>
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700"><Download className="h-4 w-4" /> PDF</button>
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700"><Mail className="h-4 w-4" /> Email</button>
          <Link to="/sales/orders/create" className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">Convert to Sales Order</Link>
          {quote.status === "draft" && (
            <button type="button" onClick={() => onStatusChange?.(quote, "sent")} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700">Send to Customer</button>
          )}
        </div>
      </div>
    </div>
  );
}
