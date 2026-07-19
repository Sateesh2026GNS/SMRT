import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

/**
 * 403 Access Denied — shown for unauthorized module / direct URL access.
 */
export default function AccessDenied({ message }) {
  const displayMessage = message || "You do not have permission to access this module.";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">403</p>
      <div className="mt-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <ShieldX className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Access Denied
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{displayMessage}</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
