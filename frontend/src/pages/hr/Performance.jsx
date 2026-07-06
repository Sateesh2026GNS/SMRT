import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getPerformanceReviews, getEmployees } from "../../api/hrApi";
import useTenantId from "../../hooks/useTenantId";



export default function Performance() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    Promise.all([
      getPerformanceReviews(tenantId),
      getEmployees(tenantId),
    ])
      .then(([revRes, empRes]) => {
        setReviews(revRes.data || []);
        setEmployees(empRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading performance reviews..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Performance Tracking</h2>
        <Link to="/hr/performance/create">Create Review</Link>
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
            { key: "review_period", label: "Period" },
            { key: "rating", label: "Rating" },
            { key: "productivity_score", label: "Productivity" },
            {
              key: "goals",
              label: "Goals",
              render: (r) =>
                r.goals_achieved != null && r.goals_total != null
                  ? `${r.goals_achieved}/${r.goals_total}`
                  : "-",
            },
            { key: "notes", label: "Notes" },
          ]}
          data={reviews}
        />
      </div>
    </div>
  );
}