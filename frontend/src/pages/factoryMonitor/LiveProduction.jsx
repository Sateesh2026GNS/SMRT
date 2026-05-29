import { Link } from "react-router-dom";
import { Factory, ArrowRight } from "lucide-react";
import ProductionDashboard from "../production/ProductionDashboard";

export default function LiveProduction() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-4">
        <Link
          to="/factory-monitor/machine-status"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
        >
          Machine Status
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/production"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
        >
          <Factory className="h-4 w-4" />
          Open in Production Management
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductionDashboard title="Live Production Status" />
    </div>
  );
}
