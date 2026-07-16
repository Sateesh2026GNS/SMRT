import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  Box,
  Download,
  FileText,
  Layers,
  Plus,
  Printer,
  RefreshCw,
  Upload,
  Warehouse,
} from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { ImportExportActionBar } from "../../components/common/PageActionBar";
import WarehouseDetailModal, { WarehouseFormModal } from "../../components/inventory/WarehouseDetailModal";
import { useToast } from "../../context/ToastContext";
import useTenantId from "../../hooks/useTenantId";
import {
  createWarehouseFull,
  deactivateWarehouse,
  getWarehouseDetail,
  getWarehouses,
  getWarehouseSummary,
  updateWarehouse,
} from "../../api/inventoryApi";
import {
  BRANCHES,
  DEMO_WAREHOUSES,
  IMPORT_TEMPLATE_HEADERS,
  PLANTS,
  TRANSFER_WORKFLOW,
  WAREHOUSE_STATUSES,
  WAREHOUSE_TYPES,
  WORKFLOW_STEPS,
  computeWarehouseSummary,
  enrichApiWarehouse,
  formatCr,
} from "../../data/warehousesMasterData";
import { exportToExcel, exportToPdf } from "../../utils/exportUtils";
import { parseImportFile } from "../../utils/importUtils";

function SummaryCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{value}</p>
          {sub && <p className="mt-0.5 text-[10px] text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, primary }) {
  if (primary) {
    return <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Primary</span>;
  }
  const active = status === "active";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
      active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
    }`}>
      {status}
    </span>
  );
}

const defaultFilters = {
  code: "",
  name: "",
  branch: "",
  plant: "",
  warehouse_type: "",
  state: "",
  status: "",
  capacity_min: "",
  manager: "",
};

export default function Warehouses() {
  const tenantId = useTenantId();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formWarehouse, setFormWarehouse] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tableSearch, setTableSearch] = useState("");

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, sRes] = await Promise.all([
        getWarehouses().catch(() => ({ data: [] })),
        getWarehouseSummary().catch(() => ({ data: null })),
      ]);
      const apiRows = wRes.data || [];
      if (apiRows.length > 0) {
        const enriched = apiRows.map((row, i) => enrichApiWarehouse(row, i));
        const demoCodes = new Set(DEMO_WAREHOUSES.map((w) => w.code));
        setWarehouses([
          ...DEMO_WAREHOUSES,
          ...enriched.filter((w) => !demoCodes.has(w.code)),
        ]);
      } else {
        setWarehouses(DEMO_WAREHOUSES);
      }
      setApiSummary(sRes.data);
    } catch {
      setWarehouses(DEMO_WAREHOUSES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const openWarehouse = async (wh) => {
    setSelected(wh);
    setDetail(null);
    if (typeof wh.id === "number") {
      try {
        const res = await getWarehouseDetail(wh.id);
        setDetail(res.data);
      } catch {
        /* use list data */
      }
    }
  };

  const filtered = useMemo(() => {
    return warehouses.filter((w) => {
      if (filters.code && !String(w.code).toLowerCase().includes(filters.code.toLowerCase())) return false;
      if (filters.name && !w.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.branch && w.branch !== filters.branch) return false;
      if (filters.plant && w.plant !== filters.plant) return false;
      if (filters.warehouse_type && w.warehouse_type !== filters.warehouse_type) return false;
      if (filters.state && w.state !== filters.state) return false;
      if (filters.status && w.status !== filters.status) return false;
      if (filters.manager && !String(w.manager_name).toLowerCase().includes(filters.manager.toLowerCase())) return false;
      if (filters.capacity_min && (w.capacity || 0) < Number(filters.capacity_min)) return false;
      return true;
    });
  }, [warehouses, filters]);

  const summary = useMemo(() => {
    if (apiSummary && !Object.values(filters).some(Boolean)) {
      return {
        total: apiSummary.total_warehouses,
        active: apiSummary.active_warehouses,
        inactive: apiSummary.total_warehouses - apiSummary.active_warehouses,
        primary: apiSummary.primary_warehouse || "—",
        utilizationPct: apiSummary.storage_utilization_pct,
        inventoryValue: apiSummary.total_inventory_value,
        lowStockWarehouses: apiSummary.low_stock_warehouses,
        pendingTransfers: apiSummary.pending_transfers,
      };
    }
    return computeWarehouseSummary(filtered);
  }, [apiSummary, filtered, filters]);

  const exportColumns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Warehouse Name" },
    { key: "branch", label: "Branch" },
    { key: "manager_name", label: "Manager" },
    { key: "capacity", label: "Capacity" },
    { key: "used_capacity", label: "Used" },
    { key: "utilization_pct", label: "Utilization %" },
    { key: "status", label: "Status" },
  ];

  const handleExportExcel = () => {
    exportToExcel(filtered, exportColumns, "warehouses");
    addToast("Exported to Excel");
  };

  const handleExportPdf = () => {
    exportToPdf(filtered, exportColumns, "Warehouse Master", "warehouses");
    addToast("Exported to PDF");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const rowsHtml = filtered.map((warehouse) => {
      const row = [
        warehouse.code || "—",
        warehouse.name || "—",
        warehouse.branch || "—",
        warehouse.manager_name || "—",
        warehouse.capacity != null ? warehouse.capacity.toLocaleString() : "—",
        warehouse.used_capacity != null ? warehouse.used_capacity.toLocaleString() : "—",
        warehouse.utilization_pct != null ? `${warehouse.utilization_pct}%` : "—",
        warehouse.status || "—",
      ];
      return `<tr>${row.map((value) => `<td>${String(value)}</td>`).join("")}</tr>`;
    }).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Warehouse Master Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            p { margin: 0 0 16px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; }
            @media print { @page { margin: 15mm; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Warehouse Master Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Branch</th><th>Manager</th><th>Capacity</th><th>Used</th><th>Utilization</th><th>Status</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadTemplate = () => {
    const header = IMPORT_TEMPLATE_HEADERS.join(",");
    const blob = new Blob([`${header}\nWH-NEW-01,New Store,Hyderabad,Plant A,Raw Material,Telangana,Manager Name,10000,active`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "warehouses_import_template.csv";
    a.click();
    addToast("Template downloaded");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const rows = await parseImportFile(file);
        if (!rows.length) {
          addToast("No data rows found in file", "error");
          return;
        }
        const newWarehouses = rows.map((row, i) =>
          enrichApiWarehouse(
            {
              ...row,
              id: `import-${Date.now()}-${i}`,
              code: row.code || `WH-IMPORT-${Date.now()}-${i}`,
              name: row.name || "—",
              status: row.status || "active",
              capacity: row.capacity ? Number(row.capacity) : 0,
            },
            warehouses.length + i
          )
        );
        setWarehouses((prev) => {
          const existingCodes = new Set(prev.map((w) => w.code));
          const fresh = newWarehouses.filter((w) => !existingCodes.has(w.code));
          return [...prev, ...fresh];
        });
        addToast(`✅ Imported ${newWarehouses.length} warehouse(s) from ${file.name}`, "success");
      } catch {
        addToast("Failed to parse file. Please use the template format.", "error");
      }
    };
    input.click();
  };

  const handleSave = async (form) => {
    const payload = {
      tenant_id: tenantId,
      name: form.name,
      code: form.code,
      branch: form.branch,
      plant: form.plant,
      warehouse_type: form.warehouse_type,
      state: form.state,
      city: form.city,
      address: form.address,
      manager_name: form.manager_name,
      manager_phone: form.manager_phone,
      capacity: form.capacity ? Number(form.capacity) : null,
      is_primary: form.is_primary,
      status: form.status,
    };
    try {
      if (formWarehouse?.id && typeof formWarehouse.id === "number") {
        await updateWarehouse(formWarehouse.id, form);
        addToast("Warehouse updated");
        loadWarehouses();
        setFormWarehouse(null);
        return;
      }
      await createWarehouseFull(payload);
      addToast("Warehouse created");
      loadWarehouses();
      setFormWarehouse(null);
      return;
    } catch {
      /* local fallback */
    }
    if (formWarehouse?.id) {
      setWarehouses((prev) => prev.map((w) => (w.id === formWarehouse.id ? { ...w, ...form } : w)));
      addToast("Warehouse updated locally");
    } else {
      const newW = {
        ...enrichApiWarehouse({ id: `new-${Date.now()}`, ...payload }, warehouses.length),
        id: `new-${Date.now()}`,
        used_capacity: 0,
        inventory_value: 0,
        created_at: new Date().toISOString().slice(0, 10),
      };
      setWarehouses((prev) => [...prev, newW]);
      addToast("Warehouse added");
    }
    setFormWarehouse(null);
  };

  const handleDeactivate = async (wh) => {
    if (!window.confirm(`Deactivate ${wh.name}?`)) return;
    if (typeof wh.id === "number") {
      try {
        await deactivateWarehouse(wh.id);
        addToast("Warehouse deactivated");
        loadWarehouses();
        setSelected(null);
        return;
      } catch {
        addToast("Could not deactivate", "error");
        return;
      }
    }
    setWarehouses((prev) => prev.map((w) => (w.id === wh.id ? { ...w, status: "inactive" } : w)));
    setSelected(null);
    addToast("Warehouse deactivated");
  };

  const columns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Warehouse Name" },
    { key: "branch", label: "Branch" },
    { key: "manager_name", label: "Manager", render: (r) => r.manager_name || "—" },
    {
      key: "capacity",
      label: "Capacity",
      render: (r) => (r.capacity != null ? r.capacity.toLocaleString() : "—"),
    },
    {
      key: "used_capacity",
      label: "Used",
      render: (r) => (r.used_capacity != null ? r.used_capacity.toLocaleString() : "0"),
    },
    {
      key: "available_capacity",
      label: "Available",
      render: (r) => (r.available_capacity != null ? r.available_capacity.toLocaleString() : "—"),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusPill status={r.status} primary={r.is_primary} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1 text-xs">
          <button type="button" onClick={() => openWarehouse(r)} className="font-semibold text-[#2563EB] hover:underline">View</button>
          <button type="button" onClick={() => setFormWarehouse(r)} className="font-semibold text-slate-600 hover:underline">Edit</button>
          <button type="button" onClick={() => openWarehouse(r)} className="font-semibold text-slate-600 hover:underline">Stock</button>
          <button type="button" onClick={() => setFormWarehouse(r)} className="font-semibold text-slate-600 hover:underline">Transfers</button>
          {r.status === "active" && (
            <button type="button" onClick={() => handleDeactivate(r)} className="font-semibold text-red-600 hover:underline">Deactivate</button>
          )}
        </div>
      ),
    },
  ];

  const emptyState = (
    <div className="py-12 text-center">
      <Warehouse className="mx-auto h-12 w-12 text-slate-300" />
      <p className="mt-4 text-sm font-medium text-slate-600">No warehouses found.</p>
      <p className="mt-1 text-sm text-slate-400">
        Click &quot;Create Warehouse&quot; to add your first warehouse.
      </p>
      <button type="button" onClick={() => setFormWarehouse({})} className="ui-btn-primary mt-4">
        <Plus className="h-4 w-4" /> Create Warehouse
      </button>
    </div>
  );

  if (loading) return <Loader label="Loading warehouses..." />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Multi-warehouse inventory, bin management, transfers, and utilization tracking.
          </p>
        </div>
        <ImportExportActionBar
          onImport={handleImport}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          onRefresh={loadWarehouses}
          importLabel="Import"
          exportExcelLabel="Export Excel"
          exportPdfLabel="Export PDF"
          printLabel="Print"
          refreshLabel="Refresh"
          importIcon={Upload}
          exportExcelIcon={Download}
          exportPdfIcon={FileText}
          printIcon={Printer}
          refreshIcon={RefreshCw}
        >
          <button type="button" onClick={() => setFormWarehouse({})} className="ui-btn-primary">
            <Plus className="h-4 w-4" /> Create Warehouse
          </button>
        </ImportExportActionBar>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Warehouses" value={summary.total} icon={Warehouse} color="bg-[#2563EB]" />
        <SummaryCard label="Active Warehouses" value={summary.active} icon={Box} color="bg-green-500" />
        <SummaryCard label="Primary Warehouse" value={summary.primary} icon={Layers} color="bg-purple-500" sub="Main store" />
        <SummaryCard label="Storage Utilization" value={`${summary.utilizationPct}%`} icon={Layers} color="bg-orange-500" />
        <SummaryCard label="Total Inventory Value" value={formatCr(summary.inventoryValue)} icon={Box} color="bg-teal-600" />
        <SummaryCard label="Low Stock Warehouses" value={summary.lowStockWarehouses} icon={AlertTriangle} color="bg-red-500" sub={`${summary.pendingTransfers} pending transfers`} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Search warehouses..."
              value={filters.name}
              onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
              className="min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {showAdvanced ? "Hide Filters" : "Advanced Filters"}
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input placeholder="Warehouse Code" value={filters.code} onChange={(e) => setFilters((f) => ({ ...f, code: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <select value={filters.branch} onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Branch</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={filters.plant} onChange={(e) => setFilters((f) => ({ ...f, plant: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Plant</option>
              {PLANTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.warehouse_type} onChange={(e) => setFilters((f) => ({ ...f, warehouse_type: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Warehouse Type</option>
              {WAREHOUSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="State" value={filters.state} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Status</option>
              {WAREHOUSE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Min Capacity" type="number" value={filters.capacity_min} onChange={(e) => setFilters((f) => ({ ...f, capacity_min: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input placeholder="Manager" value={filters.manager} onChange={(e) => setFilters((f) => ({ ...f, manager: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <button type="button" onClick={() => { setFilters(defaultFilters); setTableSearch(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Clear</button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filtered}
          searchPlaceholder="Quick search in table..."
          searchKeys={["code", "name", "branch", "manager_name"]}
          emptyState={emptyState}
          searchValue={tableSearch}
          onSearchChange={setTableSearch}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Stock Movement Flow</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            {WORKFLOW_STEPS.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm">{step}</span>
                {i < WORKFLOW_STEPS.length - 1 && <span className="text-slate-300">↓</span>}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <ArrowDownUp className="h-4 w-4" /> Warehouse Transfer Flow
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            {TRANSFER_WORKFLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm">{step}</span>
                {i < TRANSFER_WORKFLOW.length - 1 && <span className="text-slate-300">↓</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <WarehouseDetailModal
          warehouse={selected}
          detail={detail}
          onClose={() => { setSelected(null); setDetail(null); }}
          onEdit={(w) => { setFormWarehouse(w); setSelected(null); }}
          onDeactivate={handleDeactivate}
        />
      )}

      {formWarehouse && (
        <WarehouseFormModal
          warehouse={formWarehouse}
          onClose={() => setFormWarehouse(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
