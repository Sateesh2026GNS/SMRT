import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Box, Download, Package, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import MaterialDetailModal from "../../components/inventory/MaterialDetailModal";
import { useToast } from "../../context/ToastContext";
import { getItemByBarcode, getRawMaterialDetail, getRawMaterials, getRawMaterialsSummary } from "../../api/inventoryApi";
import {
  DEMO_MATERIALS,
  DEMO_MATERIALS_SUMMARY,
  DEMO_MATERIAL_DETAIL,
  MATERIAL_CATEGORIES,
  WAREHOUSES,
  formatInr,
  stockStatusColor,
  stockStatusLabel,
} from "../../data/inventoryMasterData";
import { exportToExcel } from "../../utils/exportUtils";
import useTenantId from "../../hooks/useTenantId";

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p></div>
        {Icon && <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5 text-white" /></div>}
      </div>
    </div>
  );
}

const defaultFilters = { name: "", sku: "", barcode: "", category: "", warehouse: "", vendor: "", low_stock: false, expiring: false, batch: "" };

export default function RawMaterials() {
  const tenantId = useTenantId();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_MATERIALS_SUMMARY);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getRawMaterialsSummary(), getRawMaterials()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_MATERIALS_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data?.length) setMaterials(listRes.value.data);
      else setMaterials(DEMO_MATERIALS);
    } catch { }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let rows = materials;
    if (filters.low_stock) rows = rows.filter((r) => r.status === "low_stock");
    if (filters.name) rows = rows.filter((r) => r.name?.toLowerCase().includes(filters.name.toLowerCase()));
    if (filters.sku) rows = rows.filter((r) => r.sku?.toLowerCase().includes(filters.sku.toLowerCase()));
    if (filters.category) rows = rows.filter((r) => r.category === filters.category);
    if (filters.warehouse) rows = rows.filter((r) => r.warehouse_name === filters.warehouse);
    return rows;
  }, [materials, filters]);

  const openDetail = async (row) => {
    if (typeof row.id === "number") {
      try { const res = await getRawMaterialDetail(row.id); setSelected(res.data); return; } catch { /* fallback */ }
    }
    setSelected({ ...row });
  };

  const handleBarcode = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    try {
      const res = await getItemByBarcode(tenantId, barcodeInput.trim());
      if (res.data?.found) { addToast(`Found: ${res.data.item.name}`); openDetail(res.data.item); }
      else addToast("Barcode not found", "error");
    } catch { addToast("Barcode not found", "error"); }
    setBarcodeInput("");
  };

  const columns = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Material" },
    { key: "category", label: "Category" },
    { key: "warehouse_name", label: "Warehouse" },
    { key: "batch_number", label: "Batch" },
    { key: "quantity", label: "Qty" },
    { key: "reserved", label: "Reserved" },
    { key: "available", label: "Available" },
    { key: "unit", label: "Unit" },
    { key: "reorder_level", label: "Reorder" },
    { key: "unit_cost", label: "Cost", render: (r) => r.unit_cost ? `₹${r.unit_cost}` : "—" },
    { key: "stock_value", label: "Value", render: (r) => r.stock_value ? formatInr(r.stock_value) : "—" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stockStatusColor(r.status)}`}>{stockStatusLabel(r.status)}</span> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => openDetail(r)} className="text-xs font-semibold text-[#2563EB] hover:underline">View</button>
        <Link to={`/inventory/items/create?type=raw_material&edit=${r.id}`} className="text-xs text-slate-600 hover:underline">Edit</Link>
      </div>
    )},
  ];

  if (loading) return <Loader label="Loading raw materials..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Raw Materials</h1><p className="mt-1 text-sm text-slate-500">Multi-warehouse raw material inventory with batch, barcode, and vendor tracking.</p></div>
        <div className="flex flex-wrap gap-2">
          <Link to="/inventory/items/create?type=raw_material" className="ui-btn-primary"><Plus className="h-4 w-4" /> New Material</Link>
          <button type="button" onClick={() => exportToExcel(filtered, columns.filter((c) => !c.render), "raw-materials")} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Export</button>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Materials" value={summary.total_items?.toLocaleString()} icon={Package} color="bg-[#2563EB]" />
        <KpiCard label="Available Stock" value={summary.available_stock?.toLocaleString()} icon={Box} color="bg-green-500" />
        <KpiCard label="Low Stock" value={summary.low_stock} icon={AlertTriangle} color="bg-amber-500" />
        <KpiCard label="Out of Stock" value={summary.out_of_stock} icon={Trash2} color="bg-red-500" />
        <KpiCard label="Stock Value" value={formatInr(summary.stock_value)} icon={Package} color="bg-indigo-500" />
        <KpiCard label="Expiring Soon" value={summary.expiring_soon} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleBarcode} className="mb-4 flex gap-2">
          <input value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="Scan or enter barcode..." className="flex-1 rounded-lg border px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Lookup</button>
        </form>
        <div className="mb-4 flex flex-wrap gap-3">
          <input placeholder="Search material..." value={filters.name} onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))} className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm" />
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-600">{showAdvanced ? "Hide Filters" : "Advanced Filters"}</button>
        </div>
        {showAdvanced && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input placeholder="SKU" value={filters.sku} onChange={(e) => setFilters((f) => ({ ...f, sku: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm"><option value="">Category</option>{MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select value={filters.warehouse} onChange={(e) => setFilters((f) => ({ ...f, warehouse: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm"><option value="">Warehouse</option>{WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}</select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.low_stock} onChange={(e) => setFilters((f) => ({ ...f, low_stock: e.target.checked }))} /> Low Stock</label>
          </div>
        )}
        <DataTable columns={columns} data={filtered} searchKeys={["sku", "name", "batch_number"]} showSearch={false} />
      </div>
      {selected && <MaterialDetailModal material={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
