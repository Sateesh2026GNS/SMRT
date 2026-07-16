export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 h-5 w-40 rounded bg-slate-200" />
      <div className="flex h-48 items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-slate-200" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
