import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import { getTaxReport } from "../../api/accountsApi";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import useTenantId from "../../hooks/useTenantId";



export default function TaxReports() {
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getTaxReport(tenantId, year)
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const exportExcel = () => {
    if (!data) return;
    const rows = [
      ["Tax Report", year],
      [],
      ["SGST Collected", data.sgst_collected],
      ["CGST Collected", data.cgst_collected],
      ["IGST Collected", data.igst_collected],
      ["Total Tax", data.total_tax],
      ["Total Taxable Value", data.total_taxable_value],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tax Report");
    XLSX.writeFile(wb, `Tax_Report_${year}.xlsx`);
  };

  const exportPdf = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Tax Report ${year}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`SGST Collected: $${data.sgst_collected.toFixed(2)}`, 14, 40);
    doc.text(`CGST Collected: $${data.cgst_collected.toFixed(2)}`, 14, 48);
    doc.text(`IGST Collected: $${data.igst_collected.toFixed(2)}`, 14, 56);
    doc.text(`Total Tax: $${data.total_tax.toFixed(2)}`, 14, 66);
    doc.text(`Total Taxable Value: $${data.total_taxable_value.toFixed(2)}`, 14, 74);
    doc.save(`Tax_Report_${year}.pdf`);
  };

  if (loading) return <Loader label="Loading tax report..." />;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Tax Reports (GST)</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ padding: "8px 12px" }}>
            {[2025, 2024, 2023, 2022].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={exportExcel} style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            Export Excel
          </button>
          <button onClick={exportPdf} style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            Export PDF
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <div style={{ background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 4 }}>SGST Collected</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>$ {(data?.sgst_collected || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 4 }}>CGST Collected</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>$ {(data?.cgst_collected || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 4 }}>IGST Collected</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>$ {(data?.igst_collected || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: "#dbeafe", padding: 20, borderRadius: 10, border: "1px solid #93c5fd" }}>
          <div style={{ fontSize: "0.85rem", color: "#1e40af", marginBottom: 4 }}>Total Tax</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }}>$ {(data?.total_tax || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 4 }}>Total Taxable Value</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>$ {(data?.total_taxable_value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  );
}