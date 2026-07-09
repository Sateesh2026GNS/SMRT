import { Search } from "lucide-react";
import { BRANCHES, FINANCIAL_YEARS } from "../../data/financeMasterData";

const MONTHS = [
  "All Months", "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

export default function FinanceFilters({
  search,
  onSearchChange,
  financialYear,
  onFinancialYearChange,
  month,
  onMonthChange,
  branch,
  onBranchChange,
  searchPlaceholder = "Search...",
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
          <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-500">Financial Year</label>
          <select
            value={financialYear}
            onChange={(e) => onFinancialYearChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {FINANCIAL_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-500">Month</label>
          <select
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-500">Branch</label>
          <select
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        {children && <div className="lg:col-span-2">{children}</div>}
      </div>
    </div>
  );
}
