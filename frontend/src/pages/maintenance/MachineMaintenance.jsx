import ResourcePage from "../../components/common/ResourcePage";
import { StatusBadge } from "../../components/common/Table";
import { getRecords, createRecord } from "../../api/maintenanceApi";

export default function MachineMaintenance() {
  return (
    <ResourcePage
      title="Machine Maintenance"
      subtitle="Record maintenance activities performed on machines."
      fetcher={getRecords}
      createFn={createRecord}
      createLabel="+ New Record"
      emptyTitle="No maintenance records"
      emptyDescription="Log maintenance performed on your machines."
      searchKeys={["maintenance_type", "performed_by", "description"]}
      filters={[
        {
          key: "status",
          label: "Status",
          placeholder: "All statuses",
          options: [
            { value: "scheduled", label: "Scheduled" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ],
        },
      ]}
      columns={[
        { key: "machine_id", label: "Machine" },
        { key: "maintenance_date", label: "Date" },
        { key: "maintenance_type", label: "Type" },
        { key: "performed_by", label: "Performed By" },
        {
          key: "cost",
          label: "Cost",
          render: (r) => (r.cost != null ? `₹${Number(r.cost).toLocaleString()}` : "—"),
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      fields={[
        { name: "machine_id", label: "Machine ID", type: "number", required: true },
        { name: "maintenance_date", label: "Date", type: "date", required: true },
        {
          name: "maintenance_type",
          label: "Type",
          type: "select",
          required: true,
          options: [
            { value: "preventive", label: "Preventive" },
            { value: "corrective", label: "Corrective" },
            { value: "inspection", label: "Inspection" },
          ],
        },
        { name: "performed_by", label: "Performed By" },
        { name: "cost", label: "Cost", type: "number", step: "0.01" },
        {
          name: "status",
          label: "Status",
          type: "select",
          default: "completed",
          options: [
            { value: "scheduled", label: "Scheduled" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ],
        },
        { name: "description", label: "Description", type: "textarea", full: true },
      ]}
    />
  );
}
