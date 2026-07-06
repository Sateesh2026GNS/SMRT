import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { getPayments, getInvoices } from "../../api/salesApi";
import useTenantId from "../../hooks/useTenantId";



export default function PaymentTracking() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    Promise.all([getPayments(tenantId), getInvoices(tenantId)])
      .then(([pr, ir]) => {
        setPayments(pr.data || []);
        setInvoices(ir.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const invMap = Object.fromEntries((invoices || []).map((i) => [i.id, i]));

  if (loading) return <Loader label="Loading payments..." />;

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Payment Tracking</h2>
        <Link to="/sales/payments/create" style={{ padding: "10px 18px", background: "#14b8a6", color: "#fff", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}>
          + Record Payment
        </Link>
      </div>
      <div
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
        }}
      >
        <Table
          columns={[
            { key: "id", label: "Payment#" },
            {
              key: "invoice_id",
              label: "Invoice",
              render: (r) => `INV-${invMap[r.invoice_id]?.invoice_number ?? r.invoice_id}`,
            },
            { key: "payment_date", label: "Date" },
            {
              key: "amount",
              label: "Amount",
              render: (r) => `$ ${Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            },
            { key: "method", label: "Method" },
            { key: "notes", label: "Notes" },
          ]}
          data={payments}
        />
      </div>
    </div>
  );
}