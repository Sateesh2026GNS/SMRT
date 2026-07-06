import AlertsView from "./AlertsView";

export default function ProductionDelayAlerts() {
  return (
    <AlertsView
      title="Production Delay Alerts"
      subtitle="Work orders falling behind schedule."
      alertType="production_delay"
    />
  );
}
