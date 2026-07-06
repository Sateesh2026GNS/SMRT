import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getAttendance, getEmployees, clockIn, clockOut } from "../../api/hrApi";
import useTenantId from "../../hooks/useTenantId";



function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dateFrom, setDateFrom] = useState(todayStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [clockEmployee, setClockEmployee] = useState("");
  const [action, setAction] = useState("in");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getAttendance(tenantId, {
        date_from: dateFrom,
        date_to: dateTo,
      }),
      getEmployees(tenantId),
    ])
      .then(([attRes, empRes]) => {
        setRecords(attRes.data || []);
        setEmployees(empRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  const handleClock = async (e) => {
    e.preventDefault();
    if (!clockEmployee) return;
    try {
      if (action === "in") {
        await clockIn(tenantId, Number(clockEmployee), todayStr());
      } else {
        await clockOut(tenantId, Number(clockEmployee), todayStr());
      }
      fetchData();
      setClockEmployee("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && records.length === 0) return <Loader label="Loading attendance..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <h2>Worker Attendance</h2>

      <section
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ marginBottom: "12px" }}>Clock In / Out</h3>
        <form onSubmit={handleClock} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <label>
            Employee
            <select
              value={clockEmployee}
              onChange={(e) => setClockEmployee(e.target.value)}
              required
              style={{ display: "block", padding: "8px", marginTop: "4px" }}
            >
              <option value="">Select</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.employee_code})
                </option>
              ))}
            </select>
          </label>
          <label>
            Action
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{ display: "block", padding: "8px", marginTop: "4px" }}
            >
              <option value="in">Clock In</option>
              <option value="out">Clock Out</option>
            </select>
          </label>
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: action === "in" ? "#166534" : "#b91c1c",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {action === "in" ? "Clock In" : "Clock Out"}
          </button>
        </form>
      </section>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <label>
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ marginLeft: "8px", padding: "6px" }}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ marginLeft: "8px", padding: "6px" }}
          />
        </label>
      </div>

      <div style={{ background: "#fff", padding: "16px", borderRadius: "10px" }}>
        <Table
          columns={[
            {
              key: "employee_id",
              label: "Employee",
              render: (r) => {
                const emp = employees.find((e) => e.id === r.employee_id);
                return emp?.full_name ?? r.employee_id;
              },
            },
            { key: "record_date", label: "Date" },
            {
              key: "clock_in",
              label: "Start",
              render: (r) =>
                r.clock_in
                  ? new Date(r.clock_in).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-",
            },
            {
              key: "clock_out",
              label: "End",
              render: (r) =>
                r.clock_out
                  ? new Date(r.clock_out).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-",
            },
            {
              key: "work_hours",
              label: "Work",
              render: (r) => (r.work_hours != null ? `${r.work_hours}h` : "-"),
            },
            {
              key: "capacity_hours",
              label: "Capacity",
              render: (r) => (r.capacity_hours != null ? `${r.capacity_hours}h` : "-"),
            },
            {
              key: "overtime_hours",
              label: "Overtime",
              render: (r) =>
                r.overtime_hours != null
                  ? `${r.overtime_hours}h`
                  : "-",
            },
          ]}
          data={records}
        />
      </div>
    </div>
  );
}