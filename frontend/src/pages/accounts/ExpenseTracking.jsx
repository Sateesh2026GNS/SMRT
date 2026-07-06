import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import Table from "../../components/common/Table";
import { listExpenses } from "../../api/accountsApi";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import useTenantId from "../../hooks/useTenantId";



export default function ExpenseTracking() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    listExpenses(tenantId, year)
      .then((r) => setExpenses(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const exportExcel = () => {
    const rows = [["Category", "Vendor", "Date", "Amount", "Description"]];
    expenses.forEach((e) => rows.push([e.category, e.vendor || "", e.expense_date, e.amount, e.description || ""]));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `Expenses_${year}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Expense Tracking ${year}`, 14, 20);
    doc.setFontSize(10);
    let y = 35;
    expenses.slice(0, 25).forEach((e) => {
      doc.text(`${e.category} | ${e.vendor || "-"} | ${e.expense_date} | $${Number(e.amount).toFixed(2)}`, 14, y);
      y += 6;
    });
    doc.text(`Total: $${total.toFixed(2)}`, 14, y + 5);
    doc.save(`Expenses_${year}.pdf`);
  };

  if (loading) return <Loader label="Loading expenses..." />;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Expense Tracking</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: "8px 12px" }}>
            {[2025, 2024, 2023].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Link to="/accounts/expenses/record" style={{ padding: "10px 18px", background: "#dc2626", color: "#fff", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}>
            + Record Expense
          </Link>
          <button onClick={exportExcel} style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            Export Excel
          </button>
          <button onClick={exportPdf} style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            Export PDF
          </button>
        </div>
      </div>
      <div style={{ background: "#fff", padding: 16, borderRadius: 10, border: "1px solid #e5e7eb" }}>
        <div style={{ marginBottom: 12, fontWeight: 600 }}>Total: $ {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        <Table
          columns={[
            { key: "category", label: "Category" },
            { key: "vendor", label: "Vendor" },
            { key: "expense_date", label: "Date" },
            {
              key: "amount",
              label: "Amount",
              render: (r) => `$ ${Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            },
            { key: "description", label: "Description" },
          ]}
          data={expenses}
        />
      </div>
    </div>
  );
}