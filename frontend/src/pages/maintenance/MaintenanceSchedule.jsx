import ResourcePage from "../../components/common/ResourcePage";
import { getSchedule, createSchedule } from "../../api/maintenanceApi";

export default function MaintenanceSchedule() {
  return (
    <ResourcePage
      title="Maintenance Schedule"
      subtitle="Define recurring maintenance schedules per machine."
      fetcher={getSchedule}
      createFn={createSchedule}
      createLabel="+ New Schedule"
      emptyTitle="No schedules defined"
      emptyDescription="Create maintenance schedules to plan ahead."
      searchKeys={["task_name"]}
      columns={[
        { key: "machine_id", label: "Machine" },
        { key: "task_name", label: "Task" },
        { key: "next_due_date", label: "Next Due" },
        {
          key: "frequency_days",
          label: "Every",
          render: (r) => `${r.frequency_days} days`,
        },
        {
          key: "is_active",
          label: "Active",
          render: (r) => (r.is_active ? "Yes" : "No"),
        },
      ]}
      fields={[
        { name: "machine_id", label: "Machine ID", type: "number", required: true },
        { name: "task_name", label: "Task Name", required: true, full: true },
        { name: "next_due_date", label: "Next Due Date", type: "date", required: true },
        { name: "frequency_days", label: "Frequency (days)", type: "number", default: 30 },
      ]}
    />
  );
}
