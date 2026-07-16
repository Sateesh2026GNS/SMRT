export default function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-4">
                <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="py-3 px-4">
                  <div
                    className="h-4 rounded bg-slate-100 dark:bg-slate-700/50"
                    style={{ width: c === 0 ? 80 : c === cols - 1 ? 60 : 100 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
