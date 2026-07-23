import AlertsDashboard from "./AlertsDashboard";

export default function SafetyAlerts() {
  return (
    <AlertsDashboard
      title="Safety & Incident Alerts"
      subtitle="Workplace safety incidents, hazard reports, and compliance alerts."
      initialAlertType="safety"
    />
  );
}
