import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { getMaterialRequests } from "../../api/procurementApi";
import useTenantId from "../../hooks/useTenantId";



function StatusPill({ status }) {
  const s = (status || "pending").toLowerCase();
  const map = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    fulfilled: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };
  const cls = map[s] || map.pending;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {s}
    </span>
  );
}

export default function MaterialRequests() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await getMaterialRequests(tenantId);
        setRequests(res.data || []);
      } catch (e) {
        setLoadError("Could not load material requests. Is the API running?");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading material requests..." />;

  const columns = [
    {
      key: "request_date",
      label: "DATE",
      render: (r) => (r.request_date ? String(r.request_date).slice(0, 10) : "—"),
    },
    { key: "mr_number", label: "MR #" },
    { key: "requested_by", label: "REQUESTED BY", render: (r) => r.requested_by ?? "—" },
    {
      key: "status",
      label: "STATUS",
      sortable: false,
      render: (r) => <StatusPill status={r.status} />,
    },
    { key: "notes", label: "NOTES", render: (r) => (r.notes ? String(r.notes).slice(0, 30) + (r.notes?.length > 30 ? "…" : "") : "—") },
  ];

  const emptyState = (
    <EmptyState
      icon="clipboard"
      title="No material requests yet"
      description="Create material requests to track what materials are needed."
      actionLabel="New material request"
      actionHref="/procurement/material-requests/create"
    />
  );

  const createAction = (
    <Link to="/procurement/material-requests/create" className="ui-btn-primary">
      <Plus className="h-4 w-4" />
      New material request
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Requests"
        subtitle="Create and track material requests for procurement."
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
          data={requests}
          searchPlaceholder={t("common.search")}
          searchKeys={["mr_number", "requested_by", "status"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}