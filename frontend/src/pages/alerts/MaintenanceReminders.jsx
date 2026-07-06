import AlertsView from "./AlertsView";

export default function MaintenanceReminders() {
  return (
    <AlertsView
      title="Maintenance Reminders"
      subtitle="Upcoming and overdue maintenance tasks."
      alertType="maintenance"
    />
  );
}
