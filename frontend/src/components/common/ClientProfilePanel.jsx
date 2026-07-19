import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import BrandLogo from "../common/BrandLogo";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function ClientProfilePanel({ onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  if (!user) return null;

  const rows = [
    ["Company Name", user.company_name || user.tenant_name],
    ["Company ID", user.company_code || `GNS-${String(user.company_id || user.tenant_id || "").padStart(5, "0")}`],
    ["User Name", user.name || user.full_name],
    ["Employee ID", user.employee_id],
    ["Role", user.role || user.role_name],
    ["Department", user.department],
    ["Email", user.email],
    ["Phone", user.phone],
    ["Subscription Plan", user.subscription_plan],
    ["License Status", user.license_status],
    ["Trial Expiry", formatDateTime(user.trial_expires_at)],
    ["Current Login", formatDateTime(user.current_login_at)],
    ["Last Login", formatDateTime(user.last_login_at)],
  ];

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-700">
        <BrandLogo size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {user.company_name || user.tenant_name}
          </p>
          <p className="truncate text-xs text-slate-500">{user.role || user.role_name}</p>
        </div>
      </div>
      <dl className="max-h-72 space-y-2 overflow-y-auto text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt className="shrink-0 text-slate-500">{label}</dt>
            <dd className="truncate text-right font-medium text-slate-800 dark:text-slate-200">
              {value || "—"}
            </dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-lg border border-slate-200 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
      >
        Close
      </button>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="mt-2 w-full rounded-lg border border-red-200 py-1.5 text-xs text-red-600 hover:bg-red-50"
      >
        Sign Out
      </button>
    </div>
  );
}
