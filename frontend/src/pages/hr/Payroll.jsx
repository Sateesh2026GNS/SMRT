import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, IndianRupee, Plus, RefreshCw } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import PayrollDetailModal from "../../components/hr/PayrollDetailModal";
import { useToast } from "../../context/ToastContext";
import { getPayrollEnriched, getPayrollSummary } from "../../api/hrApi";
import { DEMO_PAY_LIST, DEMO_PAY_SUMMARY, formatInr, statusColor } from "../../data/hrMasterData";

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p></div>
        {Icon && <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5 text-white" /></div>}
      </div>
    </div>
  );
}

export default function Payroll() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_PAY_SUMMARY);
  const [rows, setRows] = useState(DEMO_PAY_LIST);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getPayrollSummary(), getPayrollEnriched()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_PAY_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setRows(listRes.value.data);
      else setRows(DEMO_PAY_LIST);
    } catch {
      addToast("Using demo payroll data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: "employee_name", label: "Employee" },
    { key: "basic", label: "Basic", render: (r) => formatInr(r.basic) },
    { key: "allowance", label: "Allowance", render: (r) => formatInr(r.allowance) },
    { key: "overtime", label: "OT", render: (r) => formatInr(r.overtime) },
    { key: "bonus", label: "Bonus", render: (r) => formatInr(r.bonus) },
    { key: "pf", label: "PF", render: (r) => formatInr(r.pf) },
    { key: "esi", label: "ESI", render: (r) => formatInr(r.esi) },
    { key: "tax", label: "Tax", render: (r) => formatInr(r.tax) },
    { key: "net_salary", label: "Net Salary", render: (r) => <span className="font-semibold">{formatInr(r.net_salary)}</span> },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <button type="button" onClick={() => setSelected(r)} className="text-xs font-semibold text-[#2563EB] hover:underline">Payslip</button>
    )},
  ];

  if (loading) return <Loader label="Loading payroll..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="mt-1 text-sm text-slate-500">Enterprise payroll with PF, ESI, tax, overtime, and salary slip generation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/hr/payroll/create" className="ui-btn-primary"><Plus className="h-4 w-4" /> Create Payroll</Link>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        <KpiCard label="Monthly Payroll" value={formatInr(summary.monthly_payroll)} icon={IndianRupee} color="bg-blue-600" />
        <KpiCard label="Pending Salary" value={formatInr(summary.pending_salary)} icon={IndianRupee} color="bg-amber-500" />
        <KpiCard label="Processed" value={formatInr(summary.processed_salary)} icon={IndianRupee} color="bg-green-600" />
        <KpiCard label="OT Cost" value={formatInr(summary.overtime_cost)} icon={IndianRupee} color="bg-orange-500" />
        <KpiCard label="PF" value={formatInr(summary.pf)} icon={IndianRupee} color="bg-indigo-600" />
        <KpiCard label="ESI" value={formatInr(summary.esi)} icon={IndianRupee} color="bg-teal-600" />
        <KpiCard label="Prof. Tax" value={formatInr(summary.professional_tax)} icon={IndianRupee} color="bg-purple-600" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Payroll Register</h2>
          <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#2563EB]"><Download className="h-4 w-4" /> Export</button>
        </div>
        <DataTable columns={columns} data={rows} searchPlaceholder="Search employee..." searchKeys={["employee_name", "status"]} />
      </div>

      {selected && <PayrollDetailModal record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
