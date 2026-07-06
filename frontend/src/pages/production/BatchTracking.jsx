import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { getBatches } from "../../api/productionApi";
import useTenantId from "../../hooks/useTenantId";



function formatDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function BatchTracking() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const loadBatches = async () => {
      setLoading(true);
      try {
        const response = await getBatches(tenantId);
        setBatches(response.data || []);
      } catch (error) {
        console.error("Failed to load batches", error);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  if (loading) {
    return <Loader label={t("production.loadingBatches")} />;
  }

  const columns = [
    { key: "batch_code", label: t("production.batchCode") },
    { key: "work_order_id", label: t("production.workOrder") },
    { key: "quantity", label: t("production.quantity") },
    { key: "produced_at", label: t("production.producedAt"), render: (r) => formatDateTime(r.produced_at) },
    { key: "status", label: t("dashboard.status"), statusBadge: true },
  ];

  const emptyState = (
    <EmptyState
      icon="cube"
      title={t("production.noDataAvailable")}
      description={t("production.createFirstBatch")}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("production.batchTracking")}
        subtitle={t("production.batchTrackingSubtitle")}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <DataTable
          columns={columns}
          data={batches}
          searchPlaceholder={t("common.search")}
          searchKeys={["batch_code", "work_order_id"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}