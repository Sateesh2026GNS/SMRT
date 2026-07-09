import { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { Factory, IndianRupee, Package, RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import ExportButtons from "../../components/finance/ExportButtons";
import FinanceFilters from "../../components/finance/FinanceFilters";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getProfitLossExtended } from "../../api/accountsApi";
import { DEMO_PL, formatInr } from "../../data/financeMasterData";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

const fmt = (v) => (v != null && v !== 0 ? formatInr(v) : "—");

export default function ProfitLoss() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(DEMO_PL);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [financialYear, setFinancialYear] = useState("2025-26");
  const [month, setMonth] = useState("All Months");
  const [branch, setBranch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProfitLossExtended(year);
      if (res.data) setData({ ...DEMO_PL, ...res.data });
    } catch {
      addToast("Using demo P&L data", "info");
    } finally {
      setLoading(false);
    }
  }, [year, addToast]);

  useEffect(() => { load(); }, [load]);

  const exportExcel = () => {
    const rows = [
      ["Profit & Loss", year],
      ["Revenue", data.revenue], ["Gross Profit", data.gross_profit], ["Net Profit", data.net_profit],
      ["EBITDA", data.ebitda], ["Operating Cost", data.operating_cost],
      ["Manufacturing Cost", data.manufacturing_cost], ["Inventory Cost", data.inventory_cost],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss");
    XLSX.writeFile(wb, `Profit_Loss_${year}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Profit & Loss ${year}`, 14, 20);
    doc.setFontSize(10);
    let y = 35;
    [["Revenue", data.revenue], ["Net Profit", data.net_profit], ["EBITDA", data.ebitda]].forEach(([k, v]) => {
      doc.text(`${k}: ${formatInr(v)}`, 14, y);
      y += 8;
    });
    doc.save(`Profit_Loss_${year}.pdf`);
  };

  if (loading && !data) return <Loader label="Loading Profit & Loss..." />;

  const revenue = data?.revenue_rows || [];
  const expenses = data?.expense_rows || [];
  const hasTableData = revenue.length > 0 || expenses.length > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profit & Loss {year}</h1>
          <p className="mt-1 text-sm text-slate-500">Revenue, manufacturing cost, department analysis, and profit trends.</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons onExcel={exportExcel} onPdf={exportPdf} />
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Revenue" value={formatInr(data.revenue)} icon={TrendingUp} color="bg-blue-600" />
        <KpiCard label="Gross Profit" value={formatInr(data.gross_profit)} icon={Wallet} color="bg-green-600" />
        <KpiCard label="Net Profit" value={formatInr(data.net_profit)} icon={IndianRupee} color="bg-emerald-600" />
        <KpiCard label="EBITDA" value={formatInr(data.ebitda)} icon={TrendingUp} color="bg-indigo-600" />
        <KpiCard label="Operating Cost" value={formatInr(data.operating_cost)} icon={TrendingDown} color="bg-amber-500" />
        <KpiCard label="Manufacturing Cost" value={formatInr(data.manufacturing_cost)} icon={Factory} color="bg-orange-500" />
        <KpiCard label="Inventory Cost" value={formatInr(data.inventory_cost)} icon={Package} color="bg-purple-600" />
      </div>

      <FinanceFilters
        search={search}
        onSearchChange={setSearch}
        financialYear={financialYear}
        onFinancialYearChange={setFinancialYear}
        month={month}
        onMonthChange={setMonth}
        branch={branch}
        onBranchChange={setBranch}
        searchPlaceholder="Search category, department..."
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Year</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {[2026, 2025, 2024, 2023].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </FinanceFilters>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Monthly Revenue</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatInr(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatInr(v)} />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Expense Trend</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.expense_trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatInr(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatInr(v)} />
                <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Profit Trend</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.profit_trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatInr(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatInr(v)} />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Revenue vs Expense</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue_vs_expense || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatInr(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatInr(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Department Cost</h2>
          <ul className="space-y-2">
            {(data.department_cost || []).map((d) => (
              <li key={d.name} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium">{d.name}</span>
                <span className="font-semibold text-[#2563EB]">{formatInr(d.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Factory Cost Analysis</h2>
          <ul className="space-y-2">
            {(data.factory_cost || []).map((d) => (
              <li key={d.name} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium">{d.name}</span>
                <span className="font-semibold text-[#2563EB]">{formatInr(d.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {hasTableData ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
          <h2 className="mb-4 font-semibold text-slate-900">Detailed P&L Table</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-2 text-left">Category</th>
                {MONTHS.map((m) => <th key={m} className="border border-slate-200 p-2 text-right">{m}</th>)}
                <th className="border border-slate-200 p-2 text-right">FY</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r) => (
                <tr key={r.category}>
                  <td className="border border-slate-200 p-2">{r.category}</td>
                  {MONTHS.map((m) => <td key={m} className="border border-slate-200 p-2 text-right">{fmt(r[m.toLowerCase()])}</td>)}
                  <td className="border border-slate-200 p-2 text-right font-semibold">{fmt(r.fy)}</td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td className="border border-slate-200 p-2">Total Revenue</td>
                {MONTHS.map((_, i) => <td key={i} className="border border-slate-200 p-2 text-right">{fmt(revenue.reduce((s, r) => s + (r[MONTHS[i].toLowerCase()] || 0), 0))}</td>)}
                <td className="border border-slate-200 p-2 text-right">{fmt(data.total_revenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Detailed monthly breakdown will appear when revenue/expense entries are recorded. Summary KPIs and charts above reflect current period.
        </div>
      )}
    </div>
  );
}
