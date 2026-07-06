import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import {
  getInvoices,
  getInvoiceDetail,
  getCustomers,
} from "../../api/salesApi";
import useTenantId from "../../hooks/useTenantId";


const TEAL = "#14b8a6";
const TEAL_DARK = "#0d9488";

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    minHeight: "calc(100vh - 120px)",
    background: "#f8fafc",
  },
  sidebar: {
    background: "#0f766e",
    padding: "16px",
  },
  icon: {
    width: 32,
    height: 32,
    background: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    marginBottom: 16,
  },
  main: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: 0,
    background: "#fff",
    boxShadow: "0 0 20px rgba(0,0,0,0.06)",
  },
  leftPanel: {
    padding: "20px",
    borderRight: "1px solid #e5e7eb",
    overflowY: "auto",
  },
  rightPanel: {
    padding: "24px",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: TEAL_DARK,
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
  },
  newBtn: {
    padding: "10px 20px",
    background: TEAL,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  invoiceCard: {
    padding: "14px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    marginBottom: 10,
    cursor: "pointer",
  },
  invoiceCardSelected: {
    borderColor: TEAL,
    background: "#f0fdfa",
  },
  clientName: { fontWeight: 600, color: "#111" },
  invMeta: { fontSize: "0.85rem", color: "#6b7280", marginTop: 4 },
  invId: { color: TEAL, fontWeight: 500 },
  amount: { fontWeight: 700, marginTop: 6 },
  status: { fontSize: "0.8rem", color: TEAL, marginTop: 4 },
  detailStatus: {
    background: "#f1f5f9",
    padding: "8px 12px",
    borderRadius: 6,
    marginBottom: 20,
    fontWeight: 600,
  },
  exportBtn: {
    padding: "8px 16px",
    background: TEAL,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    float: "right",
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: "0.85rem", color: "#6b7280", marginBottom: 8 },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 12,
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "2px solid #e5e7eb",
    color: "#6b7280",
    fontSize: "0.85rem",
  },
  td: { padding: "10px 8px", borderBottom: "1px solid #f1f5f9" },
  totals: {
    textAlign: "right",
    marginTop: 20,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
  },
  totalRow: { marginBottom: 6 },
  grandTotal: { fontWeight: 700, fontSize: "1.1rem", marginTop: 12 },
};

export default function InvoiceDashboard() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getInvoices(tenantId, filter === "all" ? null : filter)
      .then((r) => setInvoices(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (selected) {
      getInvoiceDetail(selected)
        .then((r) => setDetail(r.data))
        .catch(() => setDetail(null));
    } else {
      setDetail(null);
    }
  }, [selected]);

  useEffect(() => {
    const ids = invoices.map((i) => i.id);
    if (invoices.length && (!selected || !ids.includes(selected))) {
      setSelected(invoices[0]?.id);
    }
  }, [invoices]);

  if (loading) return <Loader label="Loading..." />;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100%" }}>
      <div style={{ padding: "20px 24px", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>
          <span style={{ color: TEAL_DARK }}>Invoice Management </span>
          <span style={{ color: "#374151", fontWeight: 400 }}>Dashboard</span>
        </h1>
      </div>

      <div style={styles.main}>
        <div style={styles.leftPanel}>
          <div style={styles.header}>
            <div>
              <div style={styles.sectionTitle}>Invoice</div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <Link to="/sales/invoices/create" style={styles.newBtn}>
              + New
            </Link>
          </div>

          <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
            {invoices.length === 0 ? (
              <div style={{ color: "#6b7280", padding: 20 }}>No invoices</div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    ...styles.invoiceCard,
                    ...(selected === inv.id ? styles.invoiceCardSelected : {}),
                  }}
                  onClick={() => setSelected(inv.id)}
                >
                  <div style={styles.clientName}>
                    {inv.customer_name || `Invoice #${inv.invoice_number}`}
                  </div>
                  <div style={styles.invMeta}>
                    <span style={styles.invId}>INV-{inv.invoice_number}</span>
                    {" | "}
                    {inv.issue_date}
                  </div>
                  <div style={styles.amount}>$ {Number(inv.grand_total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                  <div style={styles.status}>{inv.status?.toUpperCase() || "DRAFT"}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.rightPanel}>
          {!detail?.invoice ? (
            <div style={{ color: "#6b7280", padding: 40 }}>Select an invoice</div>
          ) : (
            <>
              <div style={styles.detailStatus}>
                STATUS : {detail.invoice?.status?.toUpperCase() || "DRAFT"}
                <button style={styles.exportBtn}>Export</button>
              </div>

              <div style={styles.section}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                  Invoice : <span style={{ color: TEAL }}>{detail.invoice?.invoice_number}</span>
                </div>
                <div style={{ color: "#6b7280", marginTop: 8 }}>
                  Invoice Number {detail.invoice?.invoice_number} · Issue Date {detail.invoice?.issue_date}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Client</div>
                  <div style={{ fontWeight: 600 }}>{detail.customer?.name}</div>
                  <div>{detail.customer?.contact_name}</div>
                  <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                    {[detail.customer?.address_line1, detail.customer?.address_line2, detail.customer?.state]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Company</div>
                  <div style={{ fontWeight: 600 }}>SMRT</div>
                  <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Sales & Billing</div>
                </div>
              </div>

              <div style={styles.section}>
                <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
                  <div>
                    <span style={styles.sectionTitle}>Total Amount </span>
                    <strong> $ {Number(detail.invoice?.grand_total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div>
                    <span style={styles.sectionTitle}>Amount Paid </span>
                    $ {Number(detail.invoice?.amount_paid || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div>
                    <span style={styles.sectionTitle}>Balance Due </span>
                    <strong> $ {(Number(detail.invoice?.grand_total || 0) - Number(detail.invoice?.amount_paid || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  {detail.invoice?.due_date && (
                    <div>
                      <span style={styles.sectionTitle}>Due Date </span>
                      {detail.invoice.due_date}
                    </div>
                  )}
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Item & Description</th>
                    <th style={styles.th}>Qty.</th>
                    <th style={styles.th}>Rate</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.items || []).map((item, i) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{item.item_description}</td>
                      <td style={styles.td}>{item.qty}</td>
                      <td style={styles.td}>$ {Number(item.rate).toFixed(2)}</td>
                      <td style={styles.td}>$ {Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.totals}>
                <div style={styles.totalRow}>
                  Sub Total : $ {Number(detail.invoice?.subtotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <div style={styles.totalRow}>
                  Total : $ {Number(detail.invoice?.grand_total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <div style={styles.grandTotal}>
                  Balance Due : $ {(Number(detail.invoice?.grand_total || 0) - Number(detail.invoice?.amount_paid || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}