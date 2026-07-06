import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { StatusBadge } from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import usePermissions from "../../hooks/usePermissions";
import { getVendors, updateVendorApproval } from "../../api/procurementApi";
import useTenantId from "../../hooks/useTenantId";



export default function VendorManagement() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const { isAdmin } = usePermissions();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getVendors(tenantId);
      setVendors(res.data || []);
    } catch (e) {
      setLoadError("Could not load vendors. Is the API running?");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Loading vendors..." />;

  const columns = [
    { key: "name", label: "NAME" },
    { key: "contact", label: "CONTACT", render: (r) => r.contact ?? "—" },
    { key: "email", label: "EMAIL", render: (r) => r.email ?? "—" },
    { key: "phone", label: "PHONE", render: (r) => r.phone ?? "—" },
    {
      key: "approval_status",
      label: "APPROVAL",
      render: (r) => (
        <StatusBadge status={r.approval_status || "approved"} />
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "actions",
            label: "ACTIONS",
            render: (r) =>
              r.approval_status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateVendorApproval(r.id, "approved");
                        addToast("Vendor approved");
                        load();
                      } catch (err) {
                        addToast(err.response?.data?.detail || "Approval failed", "error");
                      }
                    }}
                    className="rounded-lg border border-teal-200 px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateVendorApproval(r.id, "rejected");
                        addToast("Vendor rejected");
                        load();
                      } catch (err) {
                        addToast(err.response?.data?.detail || "Update failed", "error");
                      }
                    }}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                "—"
              ),
          },
        ]
      : []),
  ];

  const emptyState = (
    <EmptyState
      icon="clipboard"
      title="No vendors yet"
      description="Add vendors to link with purchase orders and supplier payments."
      actionLabel="Create vendor"
      actionHref="/procurement/vendors/create"
    />
  );

  const createAction = (
    <Link to="/procurement/vendors/create" className="ui-btn-primary">
      <Plus className="h-4 w-4" />
      Create vendor
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Management"
        subtitle="View and manage vendors. Link them to purchase orders and payments."
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
          data={vendors}
          searchPlaceholder={t("common.search")}
          searchKeys={["name", "contact", "email", "phone"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}