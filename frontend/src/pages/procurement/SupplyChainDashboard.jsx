import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import { useToast } from "../../context/ToastContext";
import {
  getSupplierPerformance,
  getPurchaseForecast,
  getDeliveryTracking,
  getSupplyReports,
} from "../../api/supplyChainApi";

export default function SupplyChainDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [openPOs, setOpenPOs] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    Promise.all([
      getSupplyReports(),
      getSupplierPerformance(),
      getPurchaseForecast(),
      getDeliveryTracking(),
    ])
      .then(([s, sp, pf, dt]) => {
        setSummary(s.data);
        setSuppliers(sp.data || []);
        setOpenPOs(pf.data || []);
        setDeliveries(dt.data || []);
      })
      .catch((err) => {
        addToast(err.response?.data?.detail || "Failed to load supply chain data", "error");
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  if (loading) return <Loader label="Loading supply chain..." />;

  const cards = [
    { label: "Suppliers", value: summary?.suppliers ?? 0 },
    { label: "Purchase Orders", value: summary?.purchase_orders ?? 0 },
    {
      label: "Purchase Value",
      value: `₹${Number(summary?.total_purchase_value || 0).toLocaleString("en-IN")}`,
    },
    { label: "Goods Receipts", value: summary?.goods_receipts ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supply Chain"
        subtitle="Supplier performance, open purchases, and delivery tracking."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Supplier Performance</h2>
        <DataTable
          columns={[
            { key: "supplier", label: "Supplier" },
            { key: "purchase_orders", label: "POs" },
            {
              key: "total_spend",
              label: "Spend",
              render: (r) => `₹${Number(r.total_spend).toLocaleString("en-IN")}`,
            },
            { key: "received_orders", label: "Received" },
            {
              key: "fulfilment_pct",
              label: "Fulfilment %",
              render: (r) => `${r.fulfilment_pct}%`,
            },
          ]}
          data={suppliers}
          searchKeys={["supplier"]}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Open Purchase Orders</h2>
        <DataTable
          columns={[
            { key: "po_number", label: "PO #" },
            { key: "supplier", label: "Supplier" },
            { key: "status", label: "Status", statusBadge: true },
            {
              key: "expected_date",
              label: "Expected",
              render: (r) => (r.expected_date ? String(r.expected_date).slice(0, 10) : "—"),
            },
            {
              key: "amount",
              label: "Amount",
              render: (r) => `₹${Number(r.amount).toLocaleString("en-IN")}`,
            },
          ]}
          data={openPOs}
          searchKeys={["po_number", "supplier", "status"]}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Delivery Tracking</h2>
        <DataTable
          columns={[
            { key: "po_number", label: "PO #" },
            { key: "status", label: "Status", statusBadge: true },
            {
              key: "delivered",
              label: "Delivered",
              render: (r) => (r.delivered ? "Yes" : "Pending"),
            },
            { key: "receipts", label: "GRNs" },
          ]}
          data={deliveries}
          searchKeys={["po_number", "status"]}
        />
      </div>
    </div>
  );
}
