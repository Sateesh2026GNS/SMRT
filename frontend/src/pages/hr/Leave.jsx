import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getLeaveRequests, getEmployees, updateLeaveRequest } from "../../api/hrApi";

const STATUS_COLORS = {
  pending: "#f59e0b",
  approved: "#16a34a",
  rejected: "#dc2626",
};

export default function Leave() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const employeeName = (id) =>
    employees.find((e) => e.id === id)?.full_name || `Employee #${id}`;

  const load = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    Promise.all([getLeaveRequests(params), getEmployees()])
      .then(([leaveRes, empRes]) => {
        setRequests(leaveRes.data || []);
        setEmployees(empRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleStatus = async (id, status) => {
    try {
      await updateLeaveRequest(id, { status });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader label="Loading leave requests..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h2>Leave</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Link to="/hr/leave/create">Request Leave</Link>
        </div>
      </div>
      <div style={{ background: "#fff", padding: "16px", borderRadius: "10px" }}>
        <Table
          columns={[
            {
              key: "employee_id",
              label: "Employee",
              render: (r) => employeeName(r.employee_id),
            },
            { key: "leave_type", label: "Type" },
            { key: "start_date", label: "From" },
            { key: "end_date", label: "To" },
            { key: "days", label: "Days" },
            { key: "reason", label: "Reason", render: (r) => r.reason || "—" },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <span
                  style={{
                    color: STATUS_COLORS[r.status] || "#6b7280",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {r.status}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) =>
                r.status === "pending" ? (
                  <span style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={() => handleStatus(r.id, "approved")}>
                      Approve
                    </button>
                    <button type="button" onClick={() => handleStatus(r.id, "rejected")}>
                      Reject
                    </button>
                  </span>
                ) : (
                  "—"
                ),
            },
          ]}
          data={requests}
        />
      </div>
    </div>
  );
}
