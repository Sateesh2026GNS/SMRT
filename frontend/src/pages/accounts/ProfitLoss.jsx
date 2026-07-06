import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { getProfitLoss } from "../../api/accountsApi";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import useTenantId from "../../hooks/useTenantId";


const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NAV_STYLE = {
  padding: "10px 16px",
  background: "#1e40af",
  color: "#fff",
  textDecoration: "none",
  borderRadius: 6,
  fontSize: "0.9rem",
};
const NAV_ACTIVE = { ...NAV_STYLE, background: "#1e3a8a" };

const fmt = (v) => (v != null && v !== 0 ? Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "- -");

export default function ProfitLoss() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [view, setView] = useState("category");

  useEffect(() => {
    getProfitLoss(tenantId, year)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const exportExcel = () => {
    if (!data) return;
    const rows = [
      ["Profit & Loss", year],
      [],
      ["Revenue"],
      ["Category", ...MONTHS, "FY", "YTD"],
      ...(data.revenue || []).map((r) => [
        r.category,
        ...MONTHS.map((_, i) => fmt(r[MONTHS[i].toLowerCase()])),
        fmt(r.fy),
        fmt(r.ytd),
      ]),
      ["Total Revenue", "", "", "", "", "", "", "", "", "", "", "", fmt(data.total_revenue), fmt(data.total_revenue)],
      [],
      ["Cost/Expense"],
      ["Category", ...MONTHS, "FY", "YTD"],
      ...(data.expenses || []).map((r) => [
        r.category,
        ...MONTHS.map((_, i) => fmt(r[MONTHS[i].toLowerCase()])),
        fmt(r.fy),
        fmt(r.ytd),
      ]),
      ["Total Expenses", "", "", "", "", "", "", "", "", "", "", "", fmt(data.total_expenses), fmt(data.total_expenses)],
      [],
      ["Profit", "", "", "", "", "", "", "", "", "", "", "", fmt(data.profit), fmt(data.profit)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit & Loss");
    XLSX.writeFile(wb, `Profit_Loss_${year}.xlsx`);
  };

  const exportPdf = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Profit & Loss ${year}`, 14, 20);
    doc.setFontSize(10);
    let y = 35;
    doc.text("Revenue", 14, y);
    y += 6;
    (data.revenue || []).slice(0, 8).forEach((r) => {
      doc.text(`${r.category}: ${fmt(r.fy)}`, 20, y);
      y += 5;
    });
    doc.text(`Total Revenue: ${fmt(data.total_revenue)}`, 20, y);
    y += 10;
    doc.text("Cost/Expense", 14, y);
    y += 6;
    (data.expenses || []).slice(0, 8).forEach((r) => {
      doc.text(`${r.category}: ${fmt(r.fy)}`, 20, y);
      y += 5;
    });
    doc.text(`Total Expenses: ${fmt(data.total_expenses)}`, 20, y);
    y += 10;
    doc.text(`Profit: ${fmt(data.profit)}`, 14, y);
    doc.save(`Profit_Loss_${year}.pdf`);
  };

  if (loading && !data) return <Loader label="Loading Profit & Loss..." />;

  const revenue = data?.revenue || [];
  const expenses = data?.expenses || [];
  const totalRev = data?.total_revenue ?? 0;
  const totalExp = data?.total_expenses ?? 0;
  const profit = data?.profit ?? 0;

  return (
    <div style={{ background: "#fff", minHeight: "100%" }}>
      <div style={{ background: "#f8fafc", padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Link to="/" style={NAV_STYLE}>Home</Link>
        <Link to="/accounts/income/record" style={NAV_STYLE}>Record Income</Link>
        <Link to="/accounts/expenses/record" style={NAV_STYLE}>Record Expense</Link>
        <Link to="/sales/invoices/create" style={NAV_STYLE}>Create Invoice</Link>
        <Link to="/accounts" style={NAV_STYLE}>Reports</Link>
        <Link to="/sales/customers" style={NAV_STYLE}>Customers</Link>
        <Link to="/accounts/profit-loss" style={NAV_ACTIVE}>Profit & Loss</Link>
      </div>

      <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: "0 0 16px 0", fontSize: "1.5rem" }}>Profit & Loss {year}</h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label>
              <span style={{ marginRight: 8 }}>Customer/Vendor</span>
              <select value={view} onChange={(e) => setView(e.target.value)} style={{ padding: "6px 10px" }}>
                <option value="category">Category</option>
                <option value="customer">Customer/Vendor</option>
              </select>
            </label>
            <label>
              <span style={{ marginRight: 8 }}>Period:</span>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: "6px 10px" }}>
                {[2025, 2024, 2023, 2022, 2021].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={{ marginRight: 8 }}>First Fiscal Month:</span>
              <select style={{ padding: "6px 10px" }}>
                <option>January</option>
              </select>
            </label>
            <a href="#" style={{ fontSize: "0.85rem", color: "#2563eb" }}>+Add quarterly view</a>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "#1e40af", color: "#fff", padding: "12px 20px", borderRadius: 8 }}>
            {year} Revenue: {formatK(totalRev)}
          </div>
          <div style={{ background: "#1e40af", color: "#fff", padding: "12px 20px", borderRadius: 8 }}>
            {year} Profit: {formatK(profit)}
          </div>
          <div style={{ textAlign: "center", fontSize: "0.9rem" }}>Your Company Name</div>
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <strong>Revenue</strong>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportExcel} style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
              Export Excel
            </button>
            <button onClick={exportPdf} style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
              Export PDF
            </button>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: 10, textAlign: "left", border: "1px solid #e2e8f0" }}></th>
              {MONTHS.map((m) => (
                <th key={m} style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{m}</th>
              ))}
              <th style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>FY</th>
              <th style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>YTD</th>
            </tr>
          </thead>
          <tbody>
            {revenue.map((r) => (
              <tr key={r.category}>
                <td style={{ padding: 8, border: "1px solid #e2e8f0" }}>{r.category}</td>
                {MONTHS.map((m) => (
                  <td key={m} style={{ padding: 8, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(r[m.toLowerCase()])}</td>
                ))}
                <td style={{ padding: 8, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(r.fy)}</td>
                <td style={{ padding: 8, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(r.ytd)}</td>
              </tr>
            ))}
            <tr style={{ background: "#dbeafe", fontWeight: 700 }}>
              <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>Total Revenue</td>
              {MONTHS.map((_, i) => (
                <td key={i} style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>
                  {fmt(revenue.reduce((s, r) => s + (r[MONTHS[i].toLowerCase()] || 0), 0))}
                </td>
              ))}
              <td style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(totalRev)}</td>
              <td style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(totalRev)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: 8 }}>
          <a href="#" style={{ marginRight: 16, color: "#2563eb", fontSize: "0.85rem" }}>+View more rows</a>
          <a href="#" style={{ color: "#2563eb", fontSize: "0.85rem" }}>-Hide empty rows</a>
        </div>

        <div style={{ marginTop: 24 }}>
          <strong>Cost/Expense</strong>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: 8 }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ padding: 10, textAlign: "left", border: "1px solid #e2e8f0" }}></th>
              {MONTHS.map((m) => (
                <th key={m} style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{m}</th>
              ))}
              <th style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>FY</th>
              <th style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>YTD</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((r) => (
              <tr key={r.category}>
                <td style={{ padding: 8, border: "1px solid #e2e8f0" }}>{r.category}</td>
                {MONTHS.map((m) => (
                  <td key={m} style={{ padding: 8, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(r[m.toLowerCase()])}</td>
                ))}
                <td style={{ padding: 8, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(r.fy)}</td>
                <td style={{ padding: 8, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(r.ytd)}</td>
              </tr>
            ))}
            <tr style={{ background: "#dbeafe", fontWeight: 700 }}>
              <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>Total Expenses</td>
              {MONTHS.map((_, i) => (
                <td key={i} style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>
                  {fmt(expenses.reduce((s, r) => s + (r[MONTHS[i].toLowerCase()] || 0), 0))}
                </td>
              ))}
              <td style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(totalExp)}</td>
              <td style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(totalExp)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: 8 }}>
          <a href="#" style={{ marginRight: 16, color: "#2563eb", fontSize: "0.85rem" }}>+View more rows</a>
          <a href="#" style={{ color: "#2563eb", fontSize: "0.85rem" }}>-Hide empty rows</a>
        </div>

        <div style={{ marginTop: 16 }}>
          <table style={{ width: "100%", maxWidth: 400, borderCollapse: "collapse" }}>
            <tr style={{ background: "#dbeafe", fontWeight: 700 }}>
              <td style={{ padding: 10, border: "1px solid #e2e8f0" }}>Profit</td>
              {MONTHS.map((_, i) => (
                <td key={i} style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>
                  {fmt(totalRev && totalExp ? (revenue.reduce((s, r) => s + (r[MONTHS[i].toLowerCase()] || 0), 0) - expenses.reduce((s, r) => s + (r[MONTHS[i].toLowerCase()] || 0), 0)) : null)}
                </td>
              ))}
              <td style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(profit)}</td>
              <td style={{ padding: 10, textAlign: "right", border: "1px solid #e2e8f0" }}>{fmt(profit)}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatK(v) {
  if (v == null || v === 0) return "-";
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}