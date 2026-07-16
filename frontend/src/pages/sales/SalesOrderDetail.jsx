import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { StatusBadge } from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import { getSalesOrderDetail, updateSalesOrderDispatch } from "../../api/salesApi";

export default function SalesOrderDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getSalesOrderDetail(id);
        if (active) setData(res.data || null);
      } catch (err) {
        if (active) addToast(err.response?.data?.detail || "Order not found", "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, addToast]);

  if (loading) return <Loader label="Loading sales order..." />;

  if (!data?.order) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState icon="clipboard" title="Order not found" description="This sales order does not exist." />
      </div>
    );
  }

  const { order, customer } = data;

  const flags = [
    { label: "Invoiced", value: order.invoiced },
    { label: "Packed", value: order.packed },
    { label: "Shipped", value: order.shipped },
  ];

  return (
    <div className="space-y-6">
      <BackLink />
      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`Placed on ${order.order_date}`}
        action={<StatusBadge status={order.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Order Summary</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Order Number" value={order.order_number} />
            <Field label="Reference" value={order.reference_number || "—"} />
            <Field label="Order Date" value={order.order_date} />
            <Field label="Status" value={order.status} />
            <Field
              label="Total Amount"
              value={`₹${Number(order.total_amount || 0).toLocaleString()}`}
            />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {flags.map((f) => (
              <span
                key={f.label}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  f.value
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                {f.value ? "✓" : "○"} {f.label}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {!order.packed && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateSalesOrderDispatch(order.id, { packed: true });
                    addToast("Order marked as packed");
                    const res = await getSalesOrderDetail(id);
                    setData(res.data || null);
                  } catch (err) {
                    addToast(err.response?.data?.detail || "Update failed", "error");
                  }
                }}
                className="rounded-lg border border-teal-200 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                Mark packed
              </button>
            )}
            {order.packed && !order.shipped && (
              <Link
                to="/sales/dispatch"
                className="rounded-lg border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-50"
              >
                Go to dispatch
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Customer</h3>
          {customer ? (
            <dl className="space-y-3 text-sm">
              <Field label="Name" value={customer.name} />
              <Field label="Email" value={customer.email || "—"} />
              <Field label="Phone" value={customer.phone || "—"} />
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No customer linked.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/sales/orders"
      className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to sales orders
    </Link>
  );
}
