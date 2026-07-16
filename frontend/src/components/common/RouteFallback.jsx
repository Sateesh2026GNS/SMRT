/**
 * Lightweight fallback while a lazy route chunk loads.
 * Keeps shell (sidebar/nav) visible – avoids full-screen spinner on every navigation.
 */
export default function RouteFallback() {
  return (
    <div
      className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/40"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent dark:border-teal-400"
        aria-hidden
      />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
    </div>
  );
}
