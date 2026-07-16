import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Table from "./Table";
import { SearchBar, FilterSelect } from "./SearchFilter";

export default function DataTable({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filters = [],
  pageSize = 10,
  showSearch = true,
  showPagination = true,
  emptyState,
  sortable = true,
  // Optional controlled search — when provided the parent owns the value
  searchValue,
  onSearchChange,
}) {
  const { t } = useTranslation();
  const [internalSearch, setInternalSearch] = useState("");
  // Use controlled value when provided, otherwise fall back to internal state
  const search = searchValue !== undefined ? searchValue : internalSearch;
  const setSearch = (v) => {
    if (onSearchChange) onSearchChange(v);
    else setInternalSearch(v);
  };
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = data;
    if (search.trim() && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        searchKeys.some((k) => {
          const v = row[k];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }
    filters.forEach((f) => {
      const v = filterValues[f.key];
      if (v != null && v !== "") {
        result = result.filter((row) => String(row[f.key]) === String(v));
      }
    });
    return result;
  }, [data, search, searchKeys, filters, filterValues]);

  const paginated = useMemo(() => {
    if (!showPagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, showPagination]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      {(showSearch && (searchKeys.length > 0 || filters.length > 0)) && (
        <div className="flex flex-wrap items-center gap-3">
          {showSearch && searchKeys.length > 0 && (
            <SearchBar
              value={search}
              onChange={(v) => { setSearch(v); resetPage(); }}
              placeholder={searchPlaceholder}
            />
          )}
          {filters.map((f) => (
            <FilterSelect
              key={f.key}
              label={f.label}
              value={filterValues[f.key]}
              options={f.options}
              onChange={(v) => { setFilterValues((prev) => ({ ...prev, [f.key]: v })); resetPage(); }}
              placeholder={f.placeholder}
            />
          ))}
          <span className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} {t("common.results")}</span>
        </div>
      )}
      <Table columns={columns} data={paginated} emptyState={emptyState} sortable={sortable} />
      {showPagination && filtered.length > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            {t("common.page")} {page} {t("common.of")} {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {t("common.previous")}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-slate-700 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
