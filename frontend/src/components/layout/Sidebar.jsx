<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Cog } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { userCanAccess } from "../../config/permissions";
import { SIDEBAR_NAV, sectionHasActiveChild } from "../../config/sidebarNav";

function FactorySkyline() {
  return (
    <svg viewBox="0 0 200 60" className="w-full h-14 opacity-40" aria-hidden>
      <rect x="10" y="30" width="25" height="25" fill="#3B82F6" opacity="0.5" />
      <rect x="40" y="20" width="20" height="35" fill="#60A5FA" opacity="0.6" />
      <rect x="65" y="25" width="30" height="30" fill="#2563EB" opacity="0.5" />
      <rect x="100" y="15" width="18" height="40" fill="#3B82F6" opacity="0.55" />
      <rect x="125" y="28" width="25" height="27" fill="#60A5FA" opacity="0.5" />
      <rect x="155" y="22" width="22" height="33" fill="#2563EB" opacity="0.45" />
      <polygon points="40,20 50,8 60,20" fill="#93C5FD" opacity="0.6" />
      <polygon points="100,15 109,5 118,15" fill="#93C5FD" opacity="0.6" />
    </svg>
  );
}

function buildInitialExpanded(pathname) {
  const state = {};
  SIDEBAR_NAV.forEach((section) => {
    if (section.children && sectionHasActiveChild(pathname, section)) {
      state[section.key] = true;
    }
  });
  return state;
}

export default function Sidebar({ collapsed, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => buildInitialExpanded(location.pathname));

  const visibleNav = useMemo(() => {
    return SIDEBAR_NAV.map((section) => {
      if (section.to) {
        return userCanAccess(user, section.module) ? section : null;
      }
      const children = (section.children || []).filter((c) => userCanAccess(user, c.module));
      if (children.length === 0) return null;
      return { ...section, children };
    }).filter(Boolean);
  }, [user]);

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      SIDEBAR_NAV.forEach((section) => {
        if (section.children && sectionHasActiveChild(location.pathname, section)) {
          next[section.key] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  const toggleSection = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const topLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
      isActive
        ? "bg-[#2563EB] text-white font-medium shadow-md shadow-blue-900/30"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const childLinkClass = ({ isActive }) =>
    `block rounded-lg py-2 pl-9 pr-3 text-[13px] transition-colors ${
      isActive
        ? "bg-[#2563EB]/90 text-white font-medium"
        : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
    }`;

  const sectionButtonClass = (isOpen, hasActive) =>
    `flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      hasActive
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[#001B3D] text-white">
      <div className={`shrink-0 border-b border-white/10 ${collapsed ? "p-3" : "px-4 py-5"}`}>
        <Link to="/" className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`} onClick={() => onClose?.()}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#3B82F6] shadow-lg">
            <Cog className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight">SMRT AI ERP</p>
              <p className="text-[9px] leading-tight text-slate-400">{t("nav.tagline")}</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {visibleNav.map((section) => {
          if (section.to) {
            const Icon = section.icon;
            const label = t(section.labelKey);
            return (
              <NavLink
                key={section.key}
                to={section.to}
                end={section.end}
                onClick={() => onClose?.()}
                title={collapsed ? label : undefined}
                className={topLinkClass}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            );
          }

          const Icon = section.icon;
          const isOpen = expanded[section.key];
          const hasActive = sectionHasActiveChild(location.pathname, section);
          const label = t(section.labelKey);

          return (
            <div key={section.key} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={sectionButtonClass(isOpen, hasActive)}
                aria-expanded={isOpen}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="truncate text-left">{label}</span>}
                </span>
                {!collapsed && (
                  isOpen ? <ChevronDown className="h-4 w-4 shrink-0 opacity-70" /> : <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="space-y-0.5 pb-1">
                  {section.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      onClick={() => onClose?.()}
                      className={childLinkClass}
                    >
                      {t(child.labelKey)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="shrink-0 border-t border-white/10 px-3 py-4 space-y-4">
          <FactorySkyline />
          <p className="text-center text-[9px] font-medium uppercase tracking-wider text-slate-500">
            {t("nav.footerTagline")}
          </p>
        </div>
      )}
    </aside>
  );
}
=======
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Cog, RotateCcw, Trash2 } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { userCanAccess } from "../../config/permissions";
import { SIDEBAR_NAV, sectionHasActiveChild } from "../../config/sidebarNav";
import { useToast } from "../../context/ToastContext";
import { clearData, undoData } from "../../api/adminApi";


function FactorySkyline() {
  return (
    <svg viewBox="0 0 200 60" className="w-full h-14 opacity-40" aria-hidden>
      <rect x="10" y="30" width="25" height="25" fill="#3B82F6" opacity="0.5" />
      <rect x="40" y="20" width="20" height="35" fill="#60A5FA" opacity="0.6" />
      <rect x="65" y="25" width="30" height="30" fill="#2563EB" opacity="0.5" />
      <rect x="100" y="15" width="18" height="40" fill="#3B82F6" opacity="0.55" />
      <rect x="125" y="28" width="25" height="27" fill="#60A5FA" opacity="0.5" />
      <rect x="155" y="22" width="22" height="33" fill="#2563EB" opacity="0.45" />
      <polygon points="40,20 50,8 60,20" fill="#93C5FD" opacity="0.6" />
      <polygon points="100,15 109,5 118,15" fill="#93C5FD" opacity="0.6" />
    </svg>
  );
}

function buildInitialExpanded(pathname) {
  const state = {};
  SIDEBAR_NAV.forEach((section) => {
    if (section.children && sectionHasActiveChild(pathname, section)) {
      state[section.key] = true;
    }
  });
  return state;
}

export default function Sidebar({ collapsed, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => buildInitialExpanded(location.pathname));
  const { addToast } = useToast();
  const [clearing, setClearing] = useState(false);
  const [undoing, setUndoing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm(
      "⚠️ Clear ALL data?\n\nThis will permanently erase:\n• All vendors, customers, products\n• All orders, invoices, payments\n• All inventory, stock, production records\n• All HR, quality, maintenance data\n\nAn Undo backup will be saved so you can restore.\n\nClick OK to proceed."
    )) {
      return;
    }
    setClearing(true);
    try {
      await clearData();
      try { localStorage.removeItem("smrt_custom_boms"); } catch {}
      addToast("✅ All data cleared! Reloading in 2 seconds...", "success");
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (err) {
      addToast(err.response?.data?.detail || "Clear failed", "error");
      setClearing(false);
    }
  };

  const handleUndo = async () => {
    if (!window.confirm(
      "↩️ Restore all data from backup?\n\nThis will bring back everything that existed before the last Clear.\n\nClick OK to proceed."
    )) {
      return;
    }
    setUndoing(true);
    try {
      await undoData();
      try { localStorage.removeItem("smrt_custom_boms"); } catch {}
      addToast("✅ Database restored! Reloading in 2 seconds...", "success");
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (err) {
      addToast(err.response?.data?.detail || "Undo failed", "error");
      setUndoing(false);
    }
  };


  const visibleNav = useMemo(() => {
    return SIDEBAR_NAV.map((section) => {
      if (section.to) {
        return userCanAccess(user, section.module) ? section : null;
      }
      const children = (section.children || []).filter((c) => userCanAccess(user, c.module));
      if (children.length === 0) return null;
      return { ...section, children };
    }).filter(Boolean);
  }, [user]);

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      SIDEBAR_NAV.forEach((section) => {
        if (section.children && sectionHasActiveChild(location.pathname, section)) {
          next[section.key] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  const toggleSection = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const topLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
      isActive
        ? "bg-[#2563EB] text-white font-medium shadow-md shadow-blue-900/30"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  const childLinkClass = ({ isActive }) =>
    `block rounded-lg py-2 pl-9 pr-3 text-[13px] transition-colors ${
      isActive
        ? "bg-[#2563EB]/90 text-white font-medium"
        : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
    }`;

  const sectionButtonClass = (isOpen, hasActive) =>
    `flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      hasActive
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[#001B3D] text-white">
      <div className={`shrink-0 border-b border-white/10 ${collapsed ? "p-3" : "px-4 py-5"}`}>
        <Link to="/" className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`} onClick={() => onClose?.()}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#3B82F6] shadow-lg">
            <Cog className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight">SMRT ERP</p>
              <p className="text-[9px] leading-tight text-slate-400">{t("nav.tagline")}</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {visibleNav.map((section) => {
          if (section.to) {
            const Icon = section.icon;
            const label = t(section.labelKey);
            return (
              <NavLink
                key={section.key}
                to={section.to}
                end={section.end}
                onClick={() => onClose?.()}
                title={collapsed ? label : undefined}
                className={topLinkClass}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            );
          }

          const Icon = section.icon;
          const isOpen = expanded[section.key];
          const hasActive = sectionHasActiveChild(location.pathname, section);
          const label = t(section.labelKey);

          return (
            <div key={section.key} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={sectionButtonClass(isOpen, hasActive)}
                aria-expanded={isOpen}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="truncate text-left">{label}</span>}
                </span>
                {!collapsed && (
                  isOpen ? <ChevronDown className="h-4 w-4 shrink-0 opacity-70" /> : <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="space-y-0.5 pb-1">
                  {section.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      onClick={() => onClose?.()}
                      className={childLinkClass}
                    >
                      {t(child.labelKey)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="shrink-0 border-t border-white/10 px-3 py-4 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={clearing || undoing}
              onClick={handleClear}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {clearing ? "Clearing..." : "Clear"}
            </button>
            <button
              type="button"
              disabled={clearing || undoing}
              onClick={handleUndo}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {undoing ? "Undoing..." : "Undo"}
            </button>
          </div>
          <FactorySkyline />
          <p className="text-center text-[9px] font-medium uppercase tracking-wider text-slate-500">
            {t("nav.footerTagline")}
          </p>
        </div>
      )}

    </aside>
  );
}
>>>>>>> 42502626 (first commit)
