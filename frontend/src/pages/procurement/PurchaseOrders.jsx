import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { useToast } from "../../context/ToastContext";
import {
  getPurchaseOrders,
  updatePurchaseOrderStatus,
} from "../../api/procurementApi";

function StatusPill({ status }) {
  const s = (status || "draft").toLowerCase();
  const map = {
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    approved: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    received: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    closed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  const cls = map[s] || map.draft;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {s}
    </span>
  );
}

export default function PurchaseOrders() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadError, setLoadError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    getPurchaseOrders()
      .then((r) => setOrders(r.data || []))
      .catch(() => setLoadError("Could not load purchase orders. Is the API running?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updatePurchaseOrderStatus(id, status);
      addToast(`PO marked as ${status}`);
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || "Update failed", "error");
    }
  };

  if (loading && orders.length === 0) return <Loader label="Loading purchase orders..." />;

  const columns = [
    {
      key: "order_date",
      label: "Date",
      render: (r) => (r.order_date ? String(r.order_date).slice(0, 10) : "—"),
    },
    {
      key: "po_number",
      label: "PO #",
      render: (r) => (
        <span className="font-medium text-teal-600 dark:text-teal-400">
          {r.po_number || `PO-${r.id}`}
        </span>
      ),
    },
    {
      key: "supplier_name",
      label: "Supplier",
      render: (r) => r.supplier_name || `Supplier #${r.supplier_id}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (r) => <StatusPill status={r.status} />,
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (r) =>
        r.total_amount != null
          ? `₹${Number(r.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => {
        if (r.status === "draft") {
          return (
            <button
              type="button"
              onClick={() => handleStatus(r.id, "approved")}
              className="rounded-lg border border-teal-200 px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
            >
              Approve
            </button>
          );
        }
        if (r.status === "approved") {
          return (
            <button
              type="button"
              onClick={() => handleStatus(r.id, "received")}
              className="rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
            >
              Mark received
            </button>
          );
        }
        return "—";
      },
    },
  ];

  const emptyState = (
    <EmptyState
      icon="cube"
      title="No purchase orders yet"
      description="Create your first PO to track what you buy from suppliers."
      actionLabel="New purchase order"
      actionHref="/procurement/purchase-orders/create"
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase orders"
        subtitle="View, approve, and track purchase orders."
        action={
          <Link to="/procurement/purchase-orders/create" className="ui-btn-primary">
            <Plus className="h-4 w-4" />
            New purchase order
          </Link>
        }
      />
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
          {loadError}
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <DataTable
          columns={columns}
          data={orders}
          searchPlaceholder={t("common.search")}
          searchKeys={["po_number", "status", "supplier_name"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}
