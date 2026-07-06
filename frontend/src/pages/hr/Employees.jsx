import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getEmployees } from "../../api/hrApi";
import useTenantId from "../../hooks/useTenantId";



export default function Employees() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    getEmployees(tenantId)
      .then((r) => setEmployees(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading employees..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Employees</h2>
        <Link to="/hr/employees/create">Create Employee</Link>
      </div>
      <div style={{ background: "#fff", padding: "16px", borderRadius: "10px" }}>
        <Table
          columns={[
            { key: "employee_code", label: "Code" },
            { key: "full_name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "department", label: "Department" },
            { key: "hire_date", label: "Hire Date" },
            {
              key: "hourly_rate",
              label: "Hourly Rate",
              render: (r) =>
                r.hourly_rate != null ? `$${r.hourly_rate.toFixed(2)}` : "-",
            },
          ]}
          data={employees}
        />
      </div>
    </div>
  );
}