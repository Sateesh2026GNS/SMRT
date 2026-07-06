import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { getSalesOrders } from "../../api/salesApi";
import useTenantId from "../../hooks/useTenantId";



const Dot = ({ done }) => (
  <span
    className="inline-block h-2 w-2 rounded-full mr-1 align-middle"
    style={{ background: done ? "#22c55e" : "#94a3b8" }}
    title={done ? "Yes" : "No"}
  />
);

function StatusPill({ status }) {
  const s = (status || "draft").toLowerCase();
  const map = {
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    approved: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    closed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  };
  const cls = map[s] || map.draft;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${cls}`}>
      {s}
    </span>
  );
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "approved", label: "Approved" },
  { value: "closed", label: "Closed" },
];

export default function SalesOrders() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setLoading(true);
    setLoadError("");
    getSalesOrders(tenantId, filter === "all" ? null : filter)
      .then((r) => setOrders(r.data || []))
      .catch(() => setLoadError("Could not load sales orders. Is the API running?"))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading && orders.length === 0) return <Loader label="Loading sales orders..." />;

  const columns = [
    {
      key: "order_date",
      label: "Date",
      render: (r) => (r.order_date ? String(r.order_date).slice(0, 10) : "—"),
    },
    {
      key: "order_number",
      label: "Sales order",
      render: (r) => (
        <Link
          to={`/sales/orders/${r.id}`}
          className="font-medium text-teal-600 hover:underline dark:text-teal-400"
        >
          {r.order_number || `SO-${String(r.id).padStart(5, "0")}`}
        </Link>
      ),
    },
    { key: "reference_number", label: "Reference" },
    { key: "customer_name", label: "Customer" },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (r) => <StatusPill status={r.status} />,
    },
    {
      key: "invoiced",
      label: "Invoiced",
      sortable: false,
      render: (r) => <Dot done={r.invoiced} />,
    },
    {
      key: "packed",
      label: "Packed",
      sortable: false,
      render: (r) => <Dot done={r.packed} />,
    },
    {
      key: "shipped",
      label: "Shipped",
      sortable: false,
      render: (r) => <Dot done={r.shipped} />,
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (r) =>
        r.total_amount != null
          ? `₹${Number(r.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
          : "—",
    },
  ];

  const emptyState = (
    <EmptyState
      icon="clipboard"
      title="No sales orders yet"
      description="Create your first sales order to track customers and amounts."
      actionLabel="New sales order"
      actionHref="/sales/orders/create"
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales orders"
        subtitle="View your orders, filter by status, and open a row to see details."
        action={
          <Link to="/sales/orders/create" className="ui-btn-primary">
            <Plus className="h-4 w-4" />
            New sales order
          </Link>
        }
      />
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
          {loadError}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status:</span>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-teal-600 text-white dark:bg-teal-500"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <DataTable
          columns={columns}
          data={orders}
          searchPlaceholder={t("common.search")}
          searchKeys={["order_number", "reference_number", "customer_name", "status"]}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}