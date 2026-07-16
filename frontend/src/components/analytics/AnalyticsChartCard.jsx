import ChartExportMenu from "./ChartExportMenu";
import AnalyticsEmptyChart from "./AnalyticsEmptyChart";

export default function AnalyticsChartCard({
  id, title, subtitle, children, data = [], dataKeys, sourceLink, sourceLabel, height = "h-[300px]",
}) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0 || d.value2 > 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {hasData && <ChartExportMenu chartId={id} title={title} data={data} dataKeys={dataKeys} />}
      </div>
      <div id={id} className={hasData ? height : ""}>
        {hasData ? children : (
          <AnalyticsEmptyChart title={`No ${title} data`} sourceLink={sourceLink} sourceLabel={sourceLabel} />
        )}
      </div>
    </div>
  );
}
