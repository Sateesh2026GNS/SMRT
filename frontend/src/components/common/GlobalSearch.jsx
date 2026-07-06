import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

const routes = [
  { path: "/", labelKey: "nav.dashboard" },
  { path: "/production", labelKey: "nav.productionDashboard" },
  { path: "/production/planning", labelKey: "nav.productionPlanning" },
  { path: "/production/work-orders", labelKey: "nav.workOrders" },
  { path: "/production/tasks", label: "Tasks" },
  { path: "/production/machines", labelKey: "nav.machineStatus" },
  { path: "/inventory/raw-materials", labelKey: "nav.rawMaterials" },
  { path: "/inventory/finished-goods", labelKey: "nav.finishedGoods" },
  { path: "/inventory/stock-transfer", labelKey: "nav.stockTransfer" },
  { path: "/inventory/stock-adjustment", labelKey: "nav.stockAdjustment" },
  { path: "/inventory/stock-ledger", labelKey: "nav.stockLedger" },
  { path: "/inventory/stock-movement", label: "Stock movement" },
  { path: "/alerts/low-stock", labelKey: "nav.lowStockAlerts" },
  { path: "/procurement/purchase-orders", labelKey: "nav.purchaseOrders" },
  { path: "/procurement/supply-chain", label: "Supply Chain" },
  { path: "/sales/leads", labelKey: "nav.leads" },
  { path: "/sales/quotations", labelKey: "nav.quotations" },
  { path: "/sales/orders", labelKey: "nav.salesOrders" },
  { path: "/sales/dispatch", labelKey: "nav.dispatch" },
  { path: "/sales/invoices", labelKey: "nav.invoices" },
  { path: "/hr/employees", labelKey: "nav.employees" },
  { path: "/hr/leave", labelKey: "nav.leave" },
  { path: "/accounts", labelKey: "nav.exportExcelPdf" },
  { path: "/analytics/forecasting", label: "Forecasting" },
  { path: "/factory-monitor/live-production", labelKey: "nav.liveProduction" },
  { path: "/iot", labelKey: "nav.iotDashboard" },
  { path: "/settings", label: "Company settings" },
];

function routeLabel(route, t) {
  return route.label || t(route.labelKey);
}

export default function GlobalSearch({ onSelect }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);

  const matches = useMemo(() => {
    if (!query.trim()) return routes.slice(0, 8);
    const q = query.toLowerCase();
    return routes
      .filter(
        (r) =>
          routeLabel(r, t).toLowerCase().includes(q) ||
          r.path.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [query, t]);

  const showDropdown = open && (focus || query);

  const focusSearch = useCallback(() => {
    inputRef.current?.focus();
    setOpen(true);
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const handleSelect = useCallback(
    (path) => {
      navigate(path);
      setQuery("");
      setOpen(false);
      onSelect?.();
    },
    [navigate, onSelect]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        focusSearch();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      if (!showDropdown || matches.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % matches.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + matches.length) % matches.length);
      }
      if (e.key === "Enter" && matches[highlight]) {
        e.preventDefault();
        handleSelect(matches[highlight].path);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showDropdown, matches, highlight, focusSearch, handleSelect]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        placeholder={t("common.search")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setOpen(true);
          setFocus(true);
        }}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-16 text-sm placeholder-slate-400 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 transition-all"
        aria-label={t("common.search")}
        aria-expanded={showDropdown}
        aria-controls="global-search-results"
        role="combobox"
      />
      <kbd
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
        aria-hidden
      >
        Ctrl K
      </kbd>
      {showDropdown && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
        >
          {matches.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No matches — try &quot;inventory&quot; or &quot;sales&quot;
            </div>
          ) : (
            matches.map((r, i) => (
              <button
                key={r.path}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => handleSelect(r.path)}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${
                  i === highlight
                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span className="truncate font-medium">{routeLabel(r, t)}</span>
                <span className="text-xs text-slate-400 ml-auto shrink-0">{r.path}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
