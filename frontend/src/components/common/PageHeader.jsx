import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({ title, subtitle, action, backTo, backLabel = "Back" }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex flex-wrap gap-2">{action}</div>}
    </header>
  );
}
