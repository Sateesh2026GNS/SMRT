import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { useToast } from "../../context/ToastContext";
import {
  getProductionOrders,
  getProducts,
  updateProductionOrderStatus,
} from "../../api/productionApi";

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { dateStyle: "short" });
}

const STATUS_FLOW = {
  planned: { next: "in_progress", label: "Start" },
  pending: { next: "in_progress", label: "Start" },
  in_progress: { next: "completed", label: "Complete" },
};

export default function ProductionPlanning() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const productName = (id) =>
    products.find((p) => p.id === id)?.name || `Product #${id}`;

  const load = () => {
    setLoading(true);
    Promise.all([getProductionOrders(), getProducts()])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateProductionOrderStatus(id, status);
      addToast(`Order updated to ${status}`);
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || "Update failed", "error");
    }
  };

  if (loading) {
    return <Loader label={t("production.loadingProduction")} />;
  }

  const columns = [
    { key: "order_number", label: t("dashboard.order") },
    {
      key: "product_id",
      label: t("dashboard.product"),
      render: (r) => productName(r.product_id),
    },
    { key: "planned_quantity", label: t("production.plannedQty") },
    {
      key: "start_date",
      label: t("createProduction.startDate").replace(" Date", ""),
      render: (r) => formatDate(r.start_date),
    },
    {
      key: "due_date",
      label: t("createProduction.dueDate").replace(" Date", ""),
      render: (r) => formatDate(r.due_date),
    },
    { key: "status", label: t("dashboard.status"), statusBadge: true },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => {
        const flow = STATUS_FLOW[r.status];
        if (!flow) return "—";
        return (
          <button
            type="button"
            onClick={() => handleStatus(r.id, flow.next)}
            className="rounded-lg border border-teal-200 px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
          >
            {flow.label}
          </button>
        );
      },
    },
  ];

  const emptyState = (
    <EmptyState
      icon="clipboard"
      title={t("production.noDataAvailable")}
      description={t("production.createFirstProductionOrder")}
      actionLabel={t("production.newProductionOrderShort")}
      actionHref="/production/create"
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("production.productionPlanning")}
        subtitle={t("production.productionPlanningSubtitle")}
        action={
          <Link
            to="/production/create"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <span>+</span>
            {t("dashboard.newProductionOrder")}
          </Link>
        }
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <DataTable
          columns={columns}
          data={orders}
          searchKeys={["order_number", "status"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}
