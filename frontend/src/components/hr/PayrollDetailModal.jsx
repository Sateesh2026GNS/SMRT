import { Download, Mail, Printer, X } from "lucide-react";

import { formatInr, statusColor } from "../../data/hrMasterData";

export default function PayrollDetailModal({ record, onClose }) {
  if (!record) return null;
  const gross = (record.basic || 0) + (record.allowance || 0) + (record.overtime || 0) + (record.bonus || 0);
  const deductions = (record.pf || 0) + (record.esi || 0) + (record.tax || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Salary Slip</h2>
            <p className="text-sm text-slate-500">{record.employee_name} · {record.period_start} to {record.period_end}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 space-y-1 text-sm">
          <Row label="Basic" value={formatInr(record.basic)} />
          <Row label="Allowance" value={formatInr(record.allowance)} />
          <Row label="Overtime" value={formatInr(record.overtime)} />
          <Row label="Bonus" value={formatInr(record.bonus)} />
          <div className="border-t pt-2"><Row label="Gross" value={formatInr(gross)} bold /></div>
          <Row label="PF" value={`-${formatInr(record.pf)}`} />
          <Row label="ESI" value={`-${formatInr(record.esi)}`} />
          <Row label="Tax" value={`-${formatInr(record.tax)}`} />
          <div className="border-t pt-2"><Row label="Net Pay" value={formatInr(record.net_salary)} bold /></div>
        </div>

        <div className="mt-3">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(record.status)}`}>{record.status}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700"><Printer className="h-4 w-4" /> Preview</button>
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700"><Download className="h-4 w-4" /> PDF</button>
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700"><Mail className="h-4 w-4" /> Email</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-slate-900" : "text-slate-600"}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
