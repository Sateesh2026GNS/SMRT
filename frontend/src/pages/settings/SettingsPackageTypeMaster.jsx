import { useState, useMemo } from "react";
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2, FileX2, Search } from "lucide-react";

const ROWS_PER_PAGE_OPTIONS = [5, 7, 10, 25, 50];
const COLUMNS = [
  { key: "package_type", label: "Package Type" },
  { key: "gross_weight", label: "Gross Weight / Unit" },
  { key: "volumetric_weight", label: "Volumetric Weight / Unit" },
];

export default function SettingsPackageTypeMaster() {
  const [items] = useState([]);
  const [search, setSearch] = useState(Object.fromEntries(COLUMNS.map((c) => [c.key, ""])));
  const [sort, setSort] = useState({ key: "package_type", dir: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const filtered = useMemo(() => {
    let list = [...items];
    COLUMNS.forEach(({ key }) => {
      const q = (search[key] || "").toLowerCase();
      if (q) list = list.filter((r) => String(r[key] ?? "").toLowerCase().includes(q));
    });
    list.sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : -String(av).localeCompare(String(bv));
    });
    return list;
  }, [items, search, sort]);

  const total = filtered.length;
  const start = page * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const SortHeader = ({ colKey, label }) => (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setSort((s) => ({ key: colKey, dir: s.key === colKey && s.dir === "asc" ? "desc" : "asc" }))}
        className="flex items-center gap-1 text-left font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
        <span className="flex">
          <ChevronUp className={"h-3.5 w-3.5 " + (sort.key === colKey && sort.dir === "asc" ? "text-teal-600" : "text-slate-400")} />
          <ChevronDown className={"-ml-2 h-3.5 w-3.5 " + (sort.key === colKey && sort.dir === "desc" ? "text-teal-600" : "text-slate-400")} />
        </span>
      </button>
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          value={search[colKey] ?? ""}
          onChange={(e) => setSearch((s) => ({ ...s, [colKey]: e.target.value }))}
          className="w-full rounded border border-slate-200 bg-white py-1 pl-7 pr-2 text-xs placeholder-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        />
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Package Type Master</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            This is a list of package type master that will be used for creating package list
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Add Package Type Master
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-sky-50 dark:bg-sky-900/20">
              {COLUMNS.map((c) => (
                <th key={c.key} className="border-b border-slate-200 px-4 py-3 text-left dark:border-slate-700">
                  <SortHeader colKey={c.key} label={c.label} />
                </th>
              ))}
              <th className="border-b border-slate-200 px-4 py-3 text-left dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  <FileX2 className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">No data found</p>
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-700/50 dark:hover:bg-slate-800/30"
                >
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {row[c.key] ?? "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            {ROWS_PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {total === 0 ? "0 to 0 of 0" : `${start + 1} to ${Math.min(start + rowsPerPage, total)} of ${total}`}
          </span>
          <div className="flex items-center gap-0.5">
            <button type="button" onClick={() => setPage(0)} disabled={page === 0} className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700">«</button>
            <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700">‹</button>
            <button type="button" className="rounded bg-slate-200 px-2 py-1 text-sm font-medium dark:bg-slate-600">{page + 1}</button>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700">›</button>
            <button type="button" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
