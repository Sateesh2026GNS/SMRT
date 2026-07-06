import { useCallback } from "react";

import ResourcePage from "../../components/common/ResourcePage";
import { StatusBadge } from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import { getLeads, createLead, updateLeadStatus } from "../../api/salesApi";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const SOURCES = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "trade_show", label: "Trade show" },
  { value: "cold_call", label: "Cold call" },
  { value: "other", label: "Other" },
];

export default function Leads() {
  const { addToast } = useToast();

  const rowActions = useCallback(
    (row, reload) => {
      if (row.status === "converted" || row.status === "lost") {
        return <span className="text-xs text-slate-400">Closed</span>;
      }
      return (
        <select
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-600"
          value={row.status}
          onChange={async (e) => {
            try {
              await updateLeadStatus(row.id, e.target.value);
              addToast("Lead updated");
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
      );
    },
    [addToast]
  );

  return (
    <ResourcePage
      title="Leads"
      subtitle="Track prospects before they become customers."
      fetcher={() => getLeads()}
      createFn={createLead}
      createLabel="+ New Lead"
      emptyTitle="No leads yet"
      emptyDescription="Add your first sales lead to start the pipeline."
      searchKeys={["name", "company", "email", "phone"]}
      filters={[
        {
          key: "status",
          label: "Status",
          placeholder: "All statuses",
          options: STATUSES,
        },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "company", label: "Company" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "source", label: "Source" },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      rowActions={rowActions}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "company", label: "Company" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        {
          name: "source",
          label: "Source",
          type: "select",
          options: SOURCES,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          default: "new",
          options: STATUSES,
        },
        { name: "notes", label: "Notes", type: "textarea", full: true },
      ]}
    />
  );
}
