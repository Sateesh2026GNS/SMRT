import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExpense } from "../../api/accountsApi";
import useTenantId from "../../hooks/useTenantId";



export default function RecordExpense() {
  const tenantId = useTenantId();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenant_id: tenantId,
    category: "",
    vendor: "",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createExpense({ ...form, amount: Number(form.amount) });
      navigate("/accounts/expenses");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "8px 12px", marginTop: 6, border: "1px solid #d1d5db", borderRadius: 6 };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Record Expense</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <label>Category * <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required placeholder="e.g. Store Rental" style={inputStyle} /></label>
        <label>Vendor <input type="text" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} placeholder="e.g. Supplier #1" style={inputStyle} /></label>
        <label>Amount * <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required style={inputStyle} /></label>
        <label>Date * <input type="date" value={form.expense_date} onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))} required style={inputStyle} /></label>
        <label>Description <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={inputStyle} /></label>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={saving} style={{ padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Save</button>
          <button type="button" onClick={() => navigate("/accounts/expenses")} style={{ padding: "10px 20px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}