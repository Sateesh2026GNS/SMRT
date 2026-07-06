import AlertsView from "./AlertsView";

export default function MachineFailureAlerts() {
  return (
    <AlertsView
      title="Machine Failure Alerts"
      subtitle="Machines reporting faults or breakdowns."
      alertType="machine_failure"
    />
  );
}
