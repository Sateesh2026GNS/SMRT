import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import { useToast } from "../../context/ToastContext";
import { getSupplierPayments, getVendors } from "../../api/procurementApi";

export default function SupplierPayments() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [p, v] = await Promise.all([getSupplierPayments(), getVendors()]);
        if (!active) return;
        setPayments(p.data || []);
        setVendors(v.data || []);
      } catch (err) {
        if (active) addToast(err.response?.data?.detail || "Failed to load payments", "error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [addToast]);

  const vendorName = useMemo(() => {
    const map = {};
    vendors.forEach((v) => {
      map[v.id] = v.name;
    });
    return map;
  }, [vendors]);

  if (loading) return <Loader label="Loading supplier payments..." />;

  const total = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const columns = [
    {
      key: "supplier_id",
      label: "Supplier",
      render: (r) => vendorName[r.supplier_id] || `#${r.supplier_id}`,
    },
    { key: "payment_date", label: "Date" },
    {
      key: "amount",
      label: "Amount",
      render: (r) => `₹${Number(r.amount).toLocaleString()}`,
    },
    { key: "payment_method", label: "Method" },
    { key: "reference", label: "Reference" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Payments"
        subtitle={`Total paid: ₹${total.toLocaleString()}`}
        action={
          <Link
            to="/procurement/supplier-payments/create"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            + Record Payment
          </Link>
        }
      />
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <DataTable
          columns={columns}
          data={payments}
          searchPlaceholder="Search reference..."
          searchKeys={["reference", "payment_method"]}
          emptyState={
            <EmptyState
              icon="clipboard"
              title="No supplier payments"
              description="Record payments to your vendors."
              actionLabel="Record Payment"
              actionHref="/procurement/supplier-payments/create"
            />
          }
        />
      </div>
    </div>
  );
}
