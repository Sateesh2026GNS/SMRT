import ResourcePage from "../../components/common/ResourcePage";
import { StatusBadge } from "../../components/common/Table";
import { getPreventive, createPreventive } from "../../api/maintenanceApi";

export default function PreventiveMaintenance() {
  return (
    <ResourcePage
      title="Preventive Maintenance"
      subtitle="Plan recurring preventive maintenance tasks."
      fetcher={getPreventive}
      createFn={createPreventive}
      createLabel="+ Schedule Task"
      emptyTitle="No preventive tasks"
      emptyDescription="Schedule preventive maintenance to avoid downtime."
      searchKeys={["task_description", "frequency"]}
      filters={[
        {
          key: "status",
          label: "Status",
          placeholder: "All statuses",
          options: [
            { value: "scheduled", label: "Scheduled" },
            { value: "completed", label: "Completed" },
          ],
        },
      ]}
      columns={[
        { key: "machine_id", label: "Machine" },
        { key: "schedule_date", label: "Scheduled" },
        { key: "task_description", label: "Task" },
        { key: "frequency", label: "Frequency" },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      fields={[
        { name: "machine_id", label: "Machine ID", type: "number", required: true },
        { name: "schedule_date", label: "Schedule Date", type: "date", required: true },
        { name: "task_description", label: "Task Description", required: true, full: true },
        {
          name: "frequency",
          label: "Frequency",
          type: "select",
          default: "monthly",
          options: [
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          default: "scheduled",
          options: [
            { value: "scheduled", label: "Scheduled" },
            { value: "completed", label: "Completed" },
          ],
        },
      ]}
    />
  );
}
