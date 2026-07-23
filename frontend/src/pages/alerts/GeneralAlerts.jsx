import AlertsDashboard from "./AlertsDashboard";

export default function GeneralAlerts() {
  return (
    <AlertsDashboard
      title="General Alerts"
      subtitle="General system notifications and unassigned operational alerts."
      initialAlertType="general"
    />
  );
}
