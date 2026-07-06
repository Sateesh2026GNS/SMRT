import { useCallback } from "react";
import ResourcePage from "../../components/common/ResourcePage";
import { StatusBadge } from "../../components/common/Table";
import { useToast } from "../../context/ToastContext";
import { getDefects, createDefect, updateDefectStatus } from "../../api/qualityApi";

export default function DefectTracking() {
  const { addToast } = useToast();

  const rowActions = useCallback(
    (row, reload) => {
      if (row.status === "resolved") return <span className="text-xs text-slate-400">Resolved</span>;
      const next =
        row.status === "open"
          ? { status: "in_progress", label: "In progress" }
          : { status: "resolved", label: "Resolve" };
      return (
        <button
          type="button"
          onClick={async () => {
            try {
              await updateDefectStatus(row.id, next.status);
              addToast("Defect updated");
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
      title="Defect Tracking"
      subtitle="Log and track product defects."
      fetcher={getDefects}
      createFn={createDefect}
      createLabel="+ Log Defect"
      emptyTitle="No defects logged"
      emptyDescription="Record defects to track quality issues."
      searchKeys={["defect_code", "description"]}
      filters={[
        {
          key: "severity",
          label: "Severity",
          placeholder: "All severities",
          options: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ],
        },
        {
          key: "status",
          label: "Status",
          placeholder: "All statuses",
          options: [
            { value: "open", label: "Open" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ],
        },
      ]}
      columns={[
        { key: "defect_code", label: "Code" },
        { key: "description", label: "Description" },
        { key: "quantity_affected", label: "Qty Affected" },
        {
          key: "severity",
          label: "Severity",
          render: (r) => <StatusBadge status={r.severity} />,
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      fields={[
        { name: "defect_code", label: "Defect Code", required: true },
        { name: "description", label: "Description", required: true, full: true },
        { name: "quantity_affected", label: "Quantity Affected", type: "number", default: 1 },
        {
          name: "severity",
          label: "Severity",
          type: "select",
          default: "medium",
          options: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          default: "open",
          options: [
            { value: "open", label: "Open" },
            { value: "in_progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ],
        },
        { name: "product_id", label: "Product ID", type: "number" },
        { name: "batch_id", label: "Batch ID", type: "number" },
        { name: "reported_at", label: "Reported At", type: "datetime", required: true },
      ]}
      rowActions={rowActions}
    />
  );
}
