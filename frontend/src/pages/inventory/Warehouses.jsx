import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { getWarehouses } from "../../api/inventoryApi";
import useTenantId from "../../hooks/useTenantId";



export default function Warehouses() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await getWarehouses(tenantId);
        setWarehouses(res.data || []);
      } catch (e) {
        setLoadError("Could not load warehouses. Is the API running?");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading warehouses..." />;

  const columns = [
    { key: "code", label: "CODE" },
    { key: "name", label: "NAME" },
    {
      key: "capacity",
      label: "CAPACITY",
      render: (r) => (r.capacity != null ? String(r.capacity) : "—"),
    },
    {
      key: "is_primary",
      label: "PRIMARY",
      render: (r) => (r.is_primary ? "Yes" : "—"),
    },
  ];

  const emptyState = (
    <EmptyState
      icon="cube"
      title="No warehouses yet"
      description="Create your first warehouse to manage stock locations."
      actionLabel="Create warehouse"
      actionHref="/inventory/warehouses/create"
    />
  );

  const createAction = (
    <Link to="/inventory/warehouses/create" className="ui-btn-primary">
      <Plus className="h-4 w-4" />
      Create warehouse
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Management"
        subtitle="View and manage your warehouses. Add warehouses to track stock by location."
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
          data={warehouses}
          searchPlaceholder={t("common.search")}
          searchKeys={["code", "name"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}