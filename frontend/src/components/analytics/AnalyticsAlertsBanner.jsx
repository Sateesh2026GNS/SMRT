import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { alertSeverityClass } from "../../data/analyticsMasterData";

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  danger: XCircle,
};

export default function AnalyticsAlertsBanner({ alerts = [] }) {
  if (!alerts.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => {
        const Icon = icons[a.severity] || Info;
        return (
          <div key={`${a.type}-${i}`} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${alertSeverityClass(a.severity)}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{a.message}</span>
            {a.benchmark && <span className="text-xs font-medium opacity-75">{a.benchmark}</span>}
          </div>
        );
      })}
    </div>
  );
}
