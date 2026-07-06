import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import { getHrDashboard } from "../../api/hrApi";
import useTenantId from "../../hooks/useTenantId";



const cardStyle = {
  background: "#fff",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
};

export default function HRDashboard() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    getHrDashboard(tenantId)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading HR insights..." />;

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <h2>HR Insights</h2>

      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "8px", fontSize: "0.9rem", color: "#6b7280" }}>
            Employee Headcount
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{data?.headcount ?? 0}</div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>All employees</div>
        </section>
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "8px", fontSize: "0.9rem", color: "#6b7280" }}>
            Attendance Today
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {data?.attendance_today ?? 0}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Clocked in today
          </div>
        </section>
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "8px", fontSize: "0.9rem", color: "#6b7280" }}>
            Overtime (30d)
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {data?.total_overtime_30d ?? 0}h
          </div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Total overtime hours
          </div>
        </section>
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "8px", fontSize: "0.9rem", color: "#6b7280" }}>
            Payroll Pending
          </h3>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {data?.payroll_pending ?? 0}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Draft records</div>
        </section>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/hr/employees">Employees</Link>
        <Link to="/hr/attendance">Attendance</Link>
        <Link to="/hr/leave">Leave</Link>
        <Link to="/hr/payroll">Payroll</Link>
        <Link to="/hr/shifts">Shifts</Link>
        <Link to="/hr/performance">Performance</Link>
      </div>
    </div>
  );
}