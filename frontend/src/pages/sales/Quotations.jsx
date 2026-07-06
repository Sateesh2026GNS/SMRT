import { useCallback } from "react";

import ResourcePage from "../../components/common/ResourcePage";
import { StatusBadge } from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import {
  getQuotations,
  createQuotation,
  updateQuotationStatus,
} from "../../api/salesApi";

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

export default function Quotations() {
  const { addToast } = useToast();

  const rowActions = useCallback(
    (row, reload) => (
      <select
        className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-600"
        value={row.status}
        onChange={async (e) => {
          try {
            await updateQuotationStatus(row.id, e.target.value);
            addToast("Quotation updated");
            await reload();
          } catch (err) {
            addToast(err.response?.data?.detail || "Update failed", "error");
          }
        }}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    ),
    [addToast]
  );

  return (
    <ResourcePage
      title="Quotations"
      subtitle="Prepare and track price quotes for customers."
      fetcher={() => getQuotations()}
      createFn={createQuotation}
      createLabel="+ New Quotation"
      emptyTitle="No quotations yet"
      emptyDescription="Create a quotation to send pricing to a prospect or customer."
      searchKeys={["quote_number", "customer_name", "notes"]}
      filters={[
        {
          key: "status",
          label: "Status",
          placeholder: "All statuses",
          options: STATUSES,
        },
      ]}
      columns={[
        { key: "quote_number", label: "Quote #" },
        { key: "customer_name", label: "Customer" },
        {
          key: "quote_date",
          label: "Date",
          render: (r) =>
            r.quote_date ? String(r.quote_date).slice(0, 10) : "—",
        },
        {
          key: "valid_until",
          label: "Valid until",
          render: (r) =>
            r.valid_until ? String(r.valid_until).slice(0, 10) : "—",
        },
        {
          key: "total_amount",
          label: "Amount",
          render: (r) =>
            r.total_amount != null
              ? `₹${Number(r.total_amount).toLocaleString()}`
              : "—",
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      rowActions={rowActions}
      transformPayload={(values) => ({
        ...values,
        total_amount: Number(values.total_amount) || 0,
        customer_id: values.customer_id ? Number(values.customer_id) : null,
        lead_id: values.lead_id ? Number(values.lead_id) : null,
      })}
      fields={[
        { name: "quote_number", label: "Quote number", required: true },
        { name: "customer_name", label: "Customer name", required: true },
        {
          name: "quote_date",
          label: "Quote date",
          type: "date",
          required: true,
          default: new Date().toISOString().slice(0, 10),
        },
        { name: "valid_until", label: "Valid until", type: "date" },
        {
          name: "total_amount",
          label: "Total amount",
          type: "number",
          step: "0.01",
          default: "0",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          default: "draft",
          options: STATUSES,
        },
        { name: "notes", label: "Notes", type: "textarea", full: true },
      ]}
    />
  );
}
