import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export default function PageActionBar({ children, className = "" }) {
  return <div className={["flex flex-wrap gap-2", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function PageActionGroup({ children, className = "" }) {
  return <div className={["flex flex-wrap gap-2", className].filter(Boolean).join(" ")}>{children}</div>;
}

function ActionMenuItem({ onClick, icon: Icon, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={["flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50", className]
        .filter(Boolean)
        .join(" ")}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span>{label}</span>
    </button>
  );
}

export function ImportExportActionBar({
  onImport,
  onExportExcel,
  onExportPdf,
  onPrint,
  onRefresh,
  importLabel = "Import",
  exportExcelLabel = "Export Excel",
  exportPdfLabel = "Export PDF",
  printLabel = "Print",
  refreshLabel = "Refresh",
  importIcon: ImportIcon,
  exportExcelIcon: ExportExcelIcon,
  exportPdfIcon: ExportPdfIcon,
  printIcon: PrintIcon,
  refreshIcon: RefreshIcon,
  importVisible = true,
  exportExcelVisible = true,
  exportPdfVisible = true,
  printVisible = true,
  refreshVisible = true,
  children,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleChildClick = (event, childOnClick) => {
    if (childOnClick) {
      childOnClick(event);
    }
    setOpen(false);
  };

  const renderChild = () => {
    if (!children) return null;

    if (!isValidElement(children)) {
      return children;
    }

    const childClassName = ["flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50", children.props.className]
      .filter(Boolean)
      .join(" ");

    return cloneElement(children, {
      className: childClassName,
      onClick: (event) => handleChildClick(event, children.props.onClick),
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 min-w-[190px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl" role="menu">
          {children ? <div className="mb-1 border-b border-slate-100 pb-1">{renderChild()}</div> : null}
          {importVisible && onImport ? (
            <ActionMenuItem onClick={() => { onImport(); setOpen(false); }} icon={ImportIcon} label={importLabel} />
          ) : null}
          {exportExcelVisible && onExportExcel ? (
            <ActionMenuItem onClick={() => { onExportExcel(); setOpen(false); }} icon={ExportExcelIcon} label={exportExcelLabel} />
          ) : null}
          {exportPdfVisible && onExportPdf ? (
            <ActionMenuItem onClick={() => { onExportPdf(); setOpen(false); }} icon={ExportPdfIcon} label={exportPdfLabel} />
          ) : null}
          {printVisible && onPrint ? (
            <ActionMenuItem onClick={() => { onPrint(); setOpen(false); }} icon={PrintIcon} label={printLabel} />
          ) : null}
          {refreshVisible && onRefresh ? (
            <ActionMenuItem onClick={() => { onRefresh(); setOpen(false); }} icon={RefreshIcon} label={refreshLabel} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
