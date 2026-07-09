import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Briefcase, Clock, IndianRupee, RefreshCw, UserCheck, Users } from "lucide-react";

import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getHRHub } from "../../api/hrApi";
import { DEMO_HR_HUB, HR_FLOW, formatInr } from "../../data/hrMasterData";

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

const alertIcons = { certification: AlertTriangle, leave: Briefcase, payroll: IndianRupee, attendance: Clock };

export default function HRDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hub, setHub] = useState(DEMO_HR_HUB);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHRHub();
      if (res.data) setHub({ ...DEMO_HR_HUB, ...res.data });
    } catch {
      addToast("Using demo HR hub data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader label="Loading HR dashboard..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Workforce analytics, attendance, leave, payroll, and manufacturing HR insights.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Employees" value={hub.total_employees} icon={Users} color="bg-blue-600" />
        <KpiCard label="Present Today" value={hub.present_today} icon={UserCheck} color="bg-green-600" />
        <KpiCard label="Pending Leave" value={hub.pending_leave} icon={Briefcase} color="bg-amber-500" />
        <KpiCard label="Monthly Payroll" value={formatInr(hub.monthly_payroll)} icon={IndianRupee} color="bg-indigo-600" />
        <KpiCard label="Overtime (h)" value={hub.overtime_hours} icon={Clock} color="bg-orange-500" />
        <KpiCard label="New Joiners" value={hub.new_joiners} icon={Users} color="bg-teal-600" />
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-medium text-slate-600 sm:text-xs">
        {HR_FLOW.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span className="rounded bg-white px-1.5 py-0.5 shadow-sm">{s}</span>
            {i < HR_FLOW.length - 1 && <span className="text-slate-400">↓</span>}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Department Strength</h2>
          <ul className="space-y-2">
            {(hub.department_strength || []).map((d) => (
              <li key={d.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium">{d.name}</span>
                <span className="font-semibold text-[#2563EB]">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Shift Utilization</h2>
          <ul className="space-y-3">
            {(hub.shift_utilization || []).map((s) => (
              <li key={s.name}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{s.name}</span><span className="text-slate-500">{s.utilization}%</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${s.utilization}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Alerts & Notifications</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(hub.alerts || []).map((a, i) => {
            const Icon = alertIcons[a.type] || AlertTriangle;
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-900">{a.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/hr/employees" label="Employees" />
        <QuickLink to="/hr/attendance" label="Attendance" />
        <QuickLink to="/hr/leave" label="Leave" />
        <QuickLink to="/hr/payroll" label="Payroll" />
        <QuickLink to="/hr/shifts" label="Shifts" />
        <QuickLink to="/hr/performance" label="Performance" />
        <QuickLink to="/masters/departments" label="Departments" />
        <QuickLink to="/production/tasks" label="Machine Allocation" />
      </div>
    </div>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link to={to} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#2563EB] hover:text-[#2563EB]">
      {label} →
    </Link>
  );
}
