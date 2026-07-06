import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { getGoodsReceipts } from "../../api/procurementApi";
import useTenantId from "../../hooks/useTenantId";



function StatusPill({ status }) {
  const s = (status || "received").toLowerCase();
  const map = {
    received: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    partial: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  const cls = map[s] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {s}
    </span>
  );
}

export default function GoodsReceipt() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await getGoodsReceipts(tenantId);
        setReceipts(res.data || []);
      } catch (e) {
        setLoadError("Could not load goods receipts. Is the API running?");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading goods receipts..." />;

  const columns = [
    {
      key: "receipt_date",
      label: "DATE",
      render: (r) => (r.receipt_date ? String(r.receipt_date).slice(0, 10) : "—"),
    },
    { key: "grn_number", label: "GRN #" },
    { key: "warehouse_id", label: "WAREHOUSE", render: (r) => `Warehouse #${r.warehouse_id}` },
    { key: "purchase_order_id", label: "PO", render: (r) => (r.purchase_order_id ? `#${r.purchase_order_id}` : "—") },
    {
      key: "status",
      label: "STATUS",
      sortable: false,
      render: (r) => <StatusPill status={r.status} />,
    },
  ];

  const emptyState = (
    <EmptyState
      icon="cube"
      title="No goods receipts yet"
      description="Record GRNs when goods arrive to update inventory."
      actionLabel="New goods receipt"
      actionHref="/procurement/goods-receipt/create"
    />
  );

  const createAction = (
    <Link to="/procurement/goods-receipt/create" className="ui-btn-primary">
      <Plus className="h-4 w-4" />
      New goods receipt
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goods Receipt (GRN)"
        subtitle="Record and manage goods receipt notes. Link to purchase orders."
        action={createAction}
      />
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
          {loadError}
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <DataTable
          columns={columns}
          data={receipts}
          searchPlaceholder={t("common.search")}
          searchKeys={["grn_number"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}