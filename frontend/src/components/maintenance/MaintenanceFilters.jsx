import { Search } from "lucide-react";

const STATUSES = ["All Statuses", "Scheduled", "Completed", "In Progress", "Overdue", "Reported", "Resolved"];

export default function MaintenanceFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  searchPlaceholder = "Search...",
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
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
        <div className="lg:col-span-3">
          <label className="mb-1 block text-xs font-medium text-slate-500">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s === "All Statuses" ? "" : s.toLowerCase().replace(" ", "_")}>{s}</option>
            ))}
          </select>
        </div>
        {children && <div className="lg:col-span-3">{children}</div>}
      </div>
    </div>
  );
}
