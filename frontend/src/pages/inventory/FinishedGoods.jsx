import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Box, Download, Package, Plus, QrCode, RefreshCw, Truck } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getFinishedGoods, getFinishedGoodsSummary } from "../../api/inventoryApi";
import { DEMO_FINISHED_GOODS, DEMO_FG_SUMMARY, formatInr, stockStatusColor, stockStatusLabel } from "../../data/inventoryMasterData";
import { exportToExcel } from "../../utils/exportUtils";

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

export default function FinishedGoods() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState(DEMO_FINISHED_GOODS);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getFinishedGoodsSummary(), getFinishedGoods()]);
      if (listRes.status === "fulfilled" && listRes.value?.data) {
        const apiRows = listRes.value.data;
        if (apiRows.length > 0) {
          setProducts([
            ...apiRows,
            ...DEMO_FINISHED_GOODS.filter((d) => !apiRows.some((r) => r.sku === d.sku)),
          ]);
        } else {
          setProducts(DEMO_FINISHED_GOODS);
        }
      } else {
        setProducts(DEMO_FINISHED_GOODS);
      }
    } catch { addToast("Using demo finished goods data", "info"); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? products.filter((p) => [p.sku, p.name, p.batch_number, p.customer_name].some((v) => v && String(v).toLowerCase().includes(search.toLowerCase())))
    : products;

  const summary = useMemo(() => {
    const totalProducts = filtered.length;
    let availableQty = 0;
    let reservedQty = 0;
    let dispatchQty = 0;
    let damagedQty = 0;
    let stockValue = 0;

    filtered.forEach((p) => {
      const qty = Number(p.quantity || 0);
      const res = Number(p.reserved || 0);
      const avail = Number(p.available || (qty - res));
      availableQty += qty;
      reservedQty += res;
      if (p.status === "damaged") {
        damagedQty += qty;
      } else {
        dispatchQty += avail;
      }
      stockValue += qty * Number(p.unit_cost || 0);
    });

    return {
      total_products: totalProducts,
      available: availableQty,
      reserved: reservedQty,
      ready_to_dispatch: dispatchQty,
      damaged: damagedQty,
      stock_value: stockValue,
    };
  }, [filtered]);


  const columns = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Product" },
    { key: "batch_number", label: "Batch" },
    { key: "quantity", label: "Qty" },
    { key: "reserved", label: "Reserved" },
    { key: "available", label: "Available" },
    { key: "warehouse_name", label: "Warehouse" },
    { key: "customer_name", label: "Customer" },
    { key: "production_date", label: "Prod. Date" },
    { key: "expiry_date", label: "Expiry" },
    { key: "warranty", label: "Warranty" },
    { key: "serial_number", label: "Serial" },
    { key: "qr_code", label: "QR", render: (r) => <span className="inline-flex items-center gap-1 text-xs text-[#2563EB]"><QrCode className="h-3 w-3" />{r.qr_code}</span> },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stockStatusColor(r.status)}`}>{stockStatusLabel(r.status)}</span> },
  ];

  if (loading) return <Loader label="Loading finished goods..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Finished Goods</h1><p className="mt-1 text-sm text-slate-500">Production output inventory with batch, QR, serial, and dispatch readiness.</p></div>
        <div className="flex flex-wrap gap-2">
          <Link to="/inventory/items/create?type=finished_good" className="ui-btn-primary"><Plus className="h-4 w-4" /> New Product</Link>
          <button type="button" onClick={() => exportToExcel(filtered, columns.filter((c) => !c.render), "finished-goods")} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Export</button>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Products" value={summary.total_products} icon={Package} color="bg-[#2563EB]" />
        <KpiCard label="Available" value={summary.available} icon={Box} color="bg-green-500" />
        <KpiCard label="Reserved" value={summary.reserved} icon={Package} color="bg-amber-500" />
        <KpiCard label="Ready to Dispatch" value={summary.ready_to_dispatch} icon={Truck} color="bg-teal-500" />
        <KpiCard label="Damaged" value={summary.damaged} icon={AlertTriangle} color="bg-red-500" />
        <KpiCard label="Stock Value" value={formatInr(summary.stock_value)} icon={Box} color="bg-indigo-500" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input type="search" placeholder="Search SKU, product, batch, customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 w-full rounded-lg border px-3 py-2 text-sm" />
        <DataTable columns={columns} data={filtered} showSearch={false} />
      </div>
    </div>
  );
}
