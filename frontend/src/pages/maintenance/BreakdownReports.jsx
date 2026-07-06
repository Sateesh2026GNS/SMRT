import { useCallback } from "react";
import ResourcePage from "../../components/common/ResourcePage";
import { StatusBadge } from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import {
  getBreakdowns,
  createBreakdown,
  updateBreakdownStatus,
} from "../../api/maintenanceApi";

export default function BreakdownReports() {
  const { addToast } = useToast();

  const rowActions = useCallback(
    (row, reload) => {
      if (row.status === "resolved") return <span className="text-xs text-slate-400">Resolved</span>;
      const next =
        row.status === "reported"
          ? { status: "in_progress", label: "In progress" }
          : { status: "resolved", label: "Resolve" };
      return (
        <button
          type="button"
          onClick={async () => {
            try {
              await updateBreakdownStatus(row.id, next.status);
              addToast("Breakdown updated");
              await reload();
            } catch (err) {
              addToast(err.response?.data?.detail || "Update failed", "error");
            }
          }}
          className="rounded-lg border border-teal-200 px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
        >
          {next.label}
        </button>
      );
    },
    [addToast]
  );

  return (
    <ResourcePage
      title="Breakdown Reports"
      subtitle="Report and resolve machine breakdowns."
      fetcher={getBreakdowns}
      createFn={createBreakdown}
      createLabel="+ Report Breakdown"
      emptyTitle="No breakdowns reported"
      emptyDescription="Report machine breakdowns to track downtime."
      searchKeys={["description", "resolution"]}
      filters={[
        {
          key: "status",
          label: "Status",
          placeholder: "All statuses",
          options: [
            { value: "reported", label: "Reported" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ],
        },
      ]}
      columns={[
        { key: "machine_id", label: "Machine" },
        { key: "reported_at", label: "Reported At" },
        {
          key: "downtime_minutes",
          label: "Downtime",
          render: (r) => (r.downtime_minutes != null ? `${r.downtime_minutes} min` : "—"),
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "machine_id", label: "Machine ID", type: "number", required: true },
        { name: "reported_at", label: "Reported At", type: "datetime", required: true },
        { name: "downtime_minutes", label: "Downtime (minutes)", type: "number" },
        {
          name: "status",
          label: "Status",
          type: "select",
          default: "reported",
          options: [
            { value: "reported", label: "Reported" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ],
        },
        { name: "description", label: "Description", type: "textarea", full: true },
        { name: "resolution", label: "Resolution", type: "textarea", full: true },
      ]}
      rowActions={rowActions}
    />
  );
}
