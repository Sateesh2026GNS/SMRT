import { ShieldX } from "lucide-react";

export default function AccessDenied({
  module,
  message,
}) {
  const defaultMessage = module
    ? `You don't have permission to access the ${module} module. Contact your administrator if you need access.`
    : "You don't have permission to view this page.";
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <ShieldX className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Access denied
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message || defaultMessage}</p>
    </div>
  );
}
