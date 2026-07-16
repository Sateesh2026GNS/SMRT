import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Eye, Filter, Plus, RefreshCw, UserCheck, UserMinus, UserPlus, Users } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import RowActionMenu from "../../components/common/RowActionMenu";
import Loader from "../../components/common/Loader";
import EmployeeDetailModal from "../../components/hr/EmployeeDetailModal";
import { useToast } from "../../context/ToastContext";
import { getEmployeeSummary, getEmployeesEnriched } from "../../api/hrApi";
import { DEMO_EMP_LIST, DEMO_EMP_SUMMARY, deptColor, formatInr, statusColor } from "../../data/hrMasterData";

function KpiCard({ label, value, icon: Icon, color, suffix }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}{suffix || ""}</p></div>
        {Icon && <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5 text-white" /></div>}
      </div>
    </div>
  );
}

const defaultFilters = { department: "", employment_type: "", shift: "", status: "" };

export default function Employees() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_EMP_SUMMARY);
  const [rows, setRows] = useState(DEMO_EMP_LIST);
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getEmployeeSummary(), getEmployeesEnriched()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_EMP_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setRows(listRes.value.data);
      else setRows(DEMO_EMP_LIST);
    } catch {
      addToast("Using demo employee data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filters.department) list = list.filter((r) => r.department === filters.department);
    if (filters.employment_type) list = list.filter((r) => r.employment_type === filters.employment_type);
    if (filters.shift) list = list.filter((r) => r.shift === filters.shift);
    return list;
  }, [rows, filters]);

  const columns = [
    { key: "photo", label: "Photo", render: (r) => (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">{r.initials || "?"}</div>
    )},
    { key: "employee_id", label: "Employee ID" },
    { key: "full_name", label: "Name", render: (r) => <span className="font-medium text-slate-900">{r.full_name}</span> },
    { key: "department", label: "Department", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${deptColor(r.department)}`}>{r.department}</span> },
    { key: "designation", label: "Designation" },
    { key: "shift", label: "Shift" },
    { key: "reporting_manager", label: "Manager", render: (r) => r.reporting_manager || "—" },
    { key: "employment_type", label: "Type", render: (r) => <span className="capitalize">{r.employment_type}</span> },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "joining_date", label: "Joining", render: (r) => String(r.joining_date || "").slice(0, 10) || "—" },
    { key: "salary", label: "Salary", render: (r) => r.salary ? formatInr(r.salary) : "—" },
    { key: "actions", label: "Actions", sortable: false, render: (r) => (
      <RowActionMenu
        rowId={r.id}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        items={[
          { label: "View Profile", icon: <Eye className="h-4 w-4" />, onClick: () => setSelected(r) },
        ]}
      />
    )},
  ];

  if (loading) return <Loader label="Loading employees..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">Enterprise employee management with 360° profile, shift, and payroll integration.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/hr/employees/create" className="ui-btn-primary"><Plus className="h-4 w-4" /> Create Employee</Link>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Total Employees" value={summary.total_employees} icon={Users} color="bg-blue-600" />
        <KpiCard label="Present Today" value={summary.present_today} icon={UserCheck} color="bg-green-600" />
        <KpiCard label="Absent" value={summary.absent} icon={UserMinus} color="bg-red-500" />
        <KpiCard label="On Leave" value={summary.on_leave} icon={Briefcase} color="bg-amber-500" />
        <KpiCard label="Overtime (h)" value={summary.overtime} icon={Briefcase} color="bg-orange-500" />
        <KpiCard label="Departments" value={summary.departments} icon={Users} color="bg-indigo-600" />
        <KpiCard label="Contract" value={summary.contract_employees} icon={Users} color="bg-teal-600" />
        <KpiCard label="New Joiners" value={summary.new_joiners} icon={UserPlus} color="bg-purple-600" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter className="h-4 w-4" /> Filters</button>
        {showAdvanced && (
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Departments</option>
              {["Production", "Quality", "Maintenance", "Stores", "HR"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.employment_type} onChange={(e) => setFilters({ ...filters, employment_type: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Types</option>
              {["permanent", "contract", "temporary"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.shift} onChange={(e) => setFilters({ ...filters, shift: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Shifts</option>
              {["Morning", "General", "Evening", "Night"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <DataTable columns={columns} data={filtered} searchPlaceholder="Search employee, department..." searchKeys={["full_name", "employee_id", "department", "designation"]} />
      </div>

      {selected && <EmployeeDetailModal employee={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
