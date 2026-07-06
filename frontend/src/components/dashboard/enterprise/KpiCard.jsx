import { TrendingDown, TrendingUp } from "lucide-react";

import DashboardIcon from "./DashboardIcons";

export default function KpiCard({ metric }) {
  const TrendIcon = metric.trendUp ? TrendingUp : TrendingDown;
  const trendColor = metric.trendUp ? "text-emerald-600" : "text-red-500";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-white/60 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${metric.bg} opacity-80`} aria-hidden />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {metric.title}
            </p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums text-[#0F172A] sm:text-3xl">
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-sm font-medium text-slate-500">{metric.unit}</span>
              )}
              {metric.suffix && (
                <span className="text-lg font-semibold text-slate-400">{metric.suffix}</span>
              )}
            </p>
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{metric.trend}</span>
              <span className="font-normal text-slate-400">{metric.subtitle}</span>
            </div>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: metric.accent }}
          >
            <DashboardIcon name={metric.icon} />
          </div>
        </div>
      </div>
    </article>
  );
}
