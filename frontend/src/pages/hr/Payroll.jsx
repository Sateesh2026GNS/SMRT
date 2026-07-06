import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getPayroll, getEmployees } from "../../api/hrApi";
import useTenantId from "../../hooks/useTenantId";



export default function Payroll() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    Promise.all([getPayroll(tenantId), getEmployees(tenantId)])
      .then(([payRes, empRes]) => {
        setRecords(payRes.data || []);
        setEmployees(empRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading payroll..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Payroll</h2>
        <Link to="/hr/payroll/create">Create Payroll</Link>
      </div>
      <div style={{ background: "#fff", padding: "16px", borderRadius: "10px" }}>
        <Table
          columns={[
            {
              key: "employee_id",
              label: "Employee",
              render: (r) => {
                const e = employees.find((x) => x.id === r.employee_id);
                return e?.full_name ?? r.employee_id;
              },
            },
            { key: "period_start", label: "Period Start" },
            { key: "period_end", label: "Period End" },
            { key: "regular_hours", label: "Regular (h)" },
            { key: "overtime_hours", label: "Overtime (h)" },
            {
              key: "gross_pay",
              label: "Gross",
              render: (r) =>
                r.gross_pay != null ? `$${r.gross_pay.toFixed(2)}` : "-",
            },
            {
              key: "deductions",
              label: "Deductions",
              render: (r) =>
                r.deductions != null ? `$${r.deductions.toFixed(2)}` : "-",
            },
            {
              key: "net_pay",
              label: "Net",
              render: (r) =>
                r.net_pay != null ? `$${r.net_pay.toFixed(2)}` : "-",
            },
            { key: "status", label: "Status" },
          ]}
          data={records}
        />
      </div>
    </div>
  );
}