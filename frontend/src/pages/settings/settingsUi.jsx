/** Shared Settings UI primitives */

export function SettingsCard({ title, description, icon: Icon, soft, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-teal-600"
    >
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${soft}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-teal-600 opacity-0 transition group-hover:opacity-100 dark:text-teal-400">
        Open →
      </span>
    </button>
  );
}

export function PanelShell({ title, description, children, actions }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-2 space-y-6 duration-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function SectionCard({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${className}`}>
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  "ui-input w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

export function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/80">
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
      />
    </label>
  );
}

export function SkeletonCards({ count = 8 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
        />
      ))}
    </div>
  );
}
