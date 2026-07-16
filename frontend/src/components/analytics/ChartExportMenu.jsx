import { Download, FileSpreadsheet, FileText, Image, Printer } from "lucide-react";
import { exportCsv } from "../../data/analyticsMasterData";

export default function ChartExportMenu({ chartId, title, data = [], dataKeys = ["label", "value"] }) {
  const handleCsv = () => {
    const headers = dataKeys;
    const rows = data.map((d) => {
      const row = {};
      headers.forEach((h) => { row[h] = d[h]; });
      return row;
    });
    exportCsv(title?.replace(/\s+/g, "_") || "chart", rows, headers);
  };

  const handleExcel = () => handleCsv();

  const handlePrint = () => window.print();

  const handlePng = () => {
    const svg = document.querySelector(`#${chartId} svg`);
    if (!svg) { window.print(); return; }
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${title || "chart"}.png`;
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const btn = "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-[10px] text-slate-400"><Download className="inline h-3 w-3" /></span>
      <button type="button" onClick={handleExcel} className={`${btn} text-emerald-700`}><FileSpreadsheet className="h-3 w-3" /> Excel</button>
      <button type="button" onClick={handleCsv} className={`${btn} text-blue-700`}><FileText className="h-3 w-3" /> CSV</button>
      <button type="button" onClick={handlePng} className={`${btn} text-purple-700`}><Image className="h-3 w-3" /> PNG</button>
      <button type="button" onClick={handlePrint} className={`${btn} text-slate-600`}><Printer className="h-3 w-3" /> Print</button>
      <button type="button" onClick={handlePrint} className={`${btn} text-rose-700`}><FileText className="h-3 w-3" /> PDF</button>
    </div>
  );
}
