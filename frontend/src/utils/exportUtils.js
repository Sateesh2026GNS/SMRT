import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export data to Excel (Select → Apply Filters → View → Export)
 */
export function exportToExcel(data, columns, filename = "report") {
  if (!data?.length) return;
  const headers = columns.map((c) => (typeof c.label === "string" ? c.label : c.key));
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (c.render && typeof c.render === "function") return c.render(row);
      return val ?? "";
    })
  );
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export data to PDF
 */
export function exportToPdf(data, columns, title = "Report", filename = "report") {
  if (!data?.length) return;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 28);

  const headers = columns.map((c) => (typeof c.label === "string" ? c.label : c.key));
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (c.render && typeof c.render === "function") return String(c.render(row) ?? "");
      return String(val ?? "");
    })
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 34,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 148, 136] },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
