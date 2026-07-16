import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Loader from "../../components/common/Loader";
import { getInvoices, createPayment } from "../../api/salesApi";
import useTenantId from "../../hooks/useTenantId";



export default function CreatePayment() {
  const tenantId = useTenantId();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInvoice = searchParams.get("invoice_id");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    tenant_id: tenantId,
    invoice_id: preselectedInvoice || "",
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    method: "cash",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInvoices(tenantId)
      .then((r) => setInvoices(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createPayment({
        ...form,
        invoice_id: Number(form.invoice_id),
        amount: Number(form.amount),
      });
      navigate("/sales/payments");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading..." />;

  const inputStyle = { width: "100%", padding: "8px 12px", marginTop: 6, border: "1px solid #d1d5db", borderRadius: 6 };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Record Payment</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <label>
          Invoice *
          <select
            value={form.invoice_id}
            onChange={(e) => setForm((f) => ({ ...f, invoice_id: e.target.value }))}
            required
            style={inputStyle}
          >
            <option value="">Select invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                INV-{inv.invoice_number} - {inv.customer_name || "N/A"} - ${Number(inv.grand_total).toFixed(2)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount *
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
            style={inputStyle}
          />
        </label>
        <label>
          Payment Date
          <input
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
            style={inputStyle}
          />
        </label>
        <label>
          Method
          <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} style={inputStyle}>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
          </select>
        </label>
        <label>
          Notes
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} style={inputStyle} />
        </label>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={saving} style={{ padding: "10px 20px", background: "#14b8a6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
            Record Payment
          </button>
          <button type="button" onClick={() => navigate("/sales/payments")} style={{ padding: "10px 20px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 6, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}