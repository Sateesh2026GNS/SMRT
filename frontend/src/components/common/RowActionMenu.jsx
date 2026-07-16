import { useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";

export default function RowActionMenu({ rowId, openMenu, setOpenMenu, items = [] }) {
  const menuRef = useRef(null);
  const isOpen = openMenu === rowId;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, rowId, setOpenMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpenMenu(isOpen ? null : rowId)}
        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Row actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 min-w-[150px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl" role="menu">
          {items.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              type="button"
              onClick={() => {
                item.onClick?.();
                setOpenMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              role="menuitem"
            >
              {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
