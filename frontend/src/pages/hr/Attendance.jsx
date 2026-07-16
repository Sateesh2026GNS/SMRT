import { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, Filter, Moon, RefreshCw, UserCheck, UserMinus, UserX } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { clockIn, clockOut, getAttendanceEnriched, getAttendanceSummary, getEmployees } from "../../api/hrApi";
import { DEMO_ATT_LIST, DEMO_ATT_SUMMARY, sourceLabel, statusColor } from "../../data/hrMasterData";

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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_ATT_SUMMARY);
  const [rows, setRows] = useState(DEMO_ATT_LIST);
  const [employees, setEmployees] = useState([]);
  const [recordDate, setRecordDate] = useState(todayStr());
  const [clockEmployee, setClockEmployee] = useState("");
  const [action, setAction] = useState("in");
  const [view, setView] = useState("table");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes, empRes] = await Promise.allSettled([
        getAttendanceSummary({ record_date: recordDate }),
        getAttendanceEnriched({ record_date: recordDate }),
        getEmployees(),
      ]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_ATT_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setRows(listRes.value.data);
      else setRows(DEMO_ATT_LIST);
      if (empRes.status === "fulfilled") setEmployees(empRes.value?.data || []);
    } catch {
      addToast("Using demo attendance data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast, recordDate]);

  useEffect(() => { load(); }, [load]);

  const handleClock = async (e) => {
    e.preventDefault();
    if (!clockEmployee) return;
    try {
      if (action === "in") await clockIn(null, Number(clockEmployee), recordDate);
      else await clockOut(null, Number(clockEmployee), recordDate);
      addToast(action === "in" ? "Clocked in" : "Clocked out");
      load();
      setClockEmployee("");
    } catch (err) {
      addToast(err.response?.data?.detail || "Clock action failed", "error");
    }
  };

  const columns = [
    { key: "employee_name", label: "Employee" },
    { key: "shift", label: "Shift" },
    { key: "check_in", label: "Check In" },
    { key: "check_out", label: "Check Out" },
    { key: "break_minutes", label: "Break", render: (r) => `${r.break_minutes || 0}m` },
    { key: "working_hours", label: "Working Hrs", render: (r) => r.working_hours != null ? `${r.working_hours}h` : "—" },
    { key: "overtime", label: "OT", render: (r) => r.overtime != null ? `${r.overtime}h` : "—" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "source", label: "Source", render: (r) => sourceLabel(r.source) },
  ];

  if (loading && rows.length === 0) return <Loader label="Loading attendance..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Biometric, RFID, GPS, QR integration with shift-wise tracking.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Present" value={summary.present} icon={UserCheck} color="bg-green-600" />
        <KpiCard label="Absent" value={summary.absent} icon={UserMinus} color="bg-red-500" />
        <KpiCard label="Late" value={summary.late} icon={Clock} color="bg-amber-500" />
        <KpiCard label="Half Day" value={summary.half_day} icon={UserX} color="bg-orange-500" />
        <KpiCard label="Overtime (h)" value={summary.overtime} icon={Clock} color="bg-indigo-600" />
        <KpiCard label="Night Shift" value={summary.night_shift} icon={Moon} color="bg-purple-600" />
        <KpiCard label="Total Hours" value={summary.total_working_hours} icon={Clock} color="bg-teal-600" suffix="h" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Clock In / Out</h3>
        <form onSubmit={handleClock} className="flex flex-wrap items-end gap-3">
          <select value={clockEmployee} onChange={(e) => setClockEmployee(e.target.value)} required className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Select Employee</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>)}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            <option value="in">Clock In</option>
            <option value="out">Clock Out</option>
          </select>
          <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${action === "in" ? "bg-green-600" : "bg-red-600"}`}>
            {action === "in" ? "Clock In" : "Clock Out"}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          <button type="button" onClick={() => setView("table")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "table" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}>Table</button>
          <button type="button" onClick={() => setView("calendar")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${view === "calendar" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}><Calendar className="inline h-3.5 w-3.5" /> Summary</button>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {view === "table" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <DataTable columns={columns} data={rows} searchPlaceholder="Search employee..." searchKeys={["employee_name", "shift", "status"]} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Shift: Morning", present: 62, absent: 8 },
            { label: "Shift: General", present: 78, absent: 12 },
            { label: "Shift: Evening", present: 42, absent: 6 },
            { label: "Shift: Night", present: 28, absent: 4 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-green-600">{s.present}</p>
              <p className="text-xs text-slate-500">Present · {s.absent} absent</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <span className="font-semibold">Integration:</span>
        {["Biometric", "RFID", "Face Recognition", "QR Attendance", "GPS Attendance"].map((s) => (
          <span key={s} className="rounded-lg bg-white px-2 py-1 shadow-sm">{s}</span>
        ))}
      </div>
    </div>
  );
}
