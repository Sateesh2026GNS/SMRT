import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { getWorkOrders } from "../../api/productionApi";
import useTenantId from "../../hooks/useTenantId";



export default function WorkOrders() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    const loadWorkOrders = async () => {
      setLoading(true);
      try {
        const response = await getWorkOrders(tenantId);
        setWorkOrders(response.data || []);
      } catch (error) {
        console.error("Failed to load work orders", error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, []);

  if (loading) {
    return <Loader label={t("production.loadingWorkOrders")} />;
  }

  const columns = [
    { key: "work_order_number", label: t("production.workOrder") },
    { key: "production_order_id", label: t("production.productionOrder") },
    { key: "machine_id", label: t("production.machine") },
    { key: "planned_quantity", label: t("production.plannedQty") },
    { key: "actual_quantity", label: t("production.actualQty") },
    { key: "status", label: t("dashboard.status"), statusBadge: true },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const emptyState = (
    <EmptyState
      icon="clipboard"
      title={t("production.noDataAvailable")}
      description={t("production.createFirstWorkOrder")}
      actionLabel={t("production.newWorkOrder")}
      actionHref="/production/create"
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("production.workOrders")}
        subtitle={t("production.workOrdersSubtitle")}
        action={
          <Link
            to="/production/create"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <span>+</span>
            {t("production.newProductionOrderShort")}
          </Link>
        }
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <DataTable
          columns={columns}
          data={workOrders}
          searchPlaceholder={t("common.search")}
          searchKeys={["work_order_number", "production_order_id"]}
          filters={[{ key: "status", label: "Status", options: statusOptions, placeholder: "All statuses" }]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}