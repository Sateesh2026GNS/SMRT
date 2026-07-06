import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createEmployee } from "../../api/hrApi";
import useTenantId from "../../hooks/useTenantId";



export default function CreateEmployee() {
  const tenantId = useTenantId();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenant_id: tenantId,
    employee_code: "",
    full_name: "",
    email: "",
    department: "",
    hire_date: "",
    hourly_rate: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createEmployee({
        ...form,
        hire_date: form.hire_date || null,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
      });
      navigate("/hr/employees");
    } catch (err) {
      setError("Failed to create employee.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <h2>Create Employee</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        <label>
          Employee Code
          <input
            type="text"
            value={form.employee_code}
            onChange={(e) => setForm((f) => ({ ...f, employee_code: e.target.value }))}
            required
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </label>
        <label>
          Full Name
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </label>
        <label>
          Department
          <input
            type="text"
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </label>
        <label>
          Hire Date
          <input
            type="date"
            value={form.hire_date}
            onChange={(e) => setForm((f) => ({ ...f, hire_date: e.target.value }))}
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </label>
        <label>
          Hourly Rate ($)
          <input
            type="number"
            step="0.01"
            value={form.hourly_rate}
            onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
            style={{ width: "100%", padding: "8px", marginTop: "6px" }}
          />
        </label>
        {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 16px",
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {saving ? "Saving..." : "Create"}
        </button>
      </form>
    </div>
  );
}