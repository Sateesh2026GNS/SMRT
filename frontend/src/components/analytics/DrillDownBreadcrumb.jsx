import { ChevronRight } from "lucide-react";
import { formatInr } from "../../data/analyticsMasterData";

export default function DrillDownBreadcrumb({ trail = [], onSelect }) {
  if (!trail.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm dark:border-blue-900 dark:bg-blue-950">
      <span className="font-medium text-blue-800 dark:text-blue-200">Drill Down:</span>
      {trail.map((item, i) => (
        <span key={`${item.level}-${item.label}`} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-blue-400" />}
          <button
            type="button"
            onClick={() => onSelect?.(item, i)}
            className="rounded px-1.5 py-0.5 font-semibold text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            {item.label}
            {item.value != null && <span className="ml-1 font-normal opacity-75">({typeof item.value === "number" && item.value > 10000 ? formatInr(item.value) : item.value})</span>}
          </button>
        </span>
      ))}
    </div>
  );
}
