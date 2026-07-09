import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  Mail,
  Maximize2,
  Menu,
  UserCircle,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useNotifications from "../../hooks/useNotifications";
import { userCanAccess } from "../../config/permissions";
import GlobalSearch from "../common/GlobalSearch";

function getPageMeta(pathname, t) {
  if (pathname === "/") {
    return {
      title: t("nav.dashboard"),
      subtitle: t("dashboard.welcomeAdmin"),
    };
  }
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const title = segment.charAt(0).toUpperCase() + segment.replace(/-/g, " ").slice(1);
  return { title, subtitle: null };
}

function severityDot(severity) {
  if (severity === "high" || severity === "critical") return "bg-red-500";
  if (severity === "medium") return "bg-orange-400";
  return "bg-blue-500";
}

const CATEGORY_COLORS = {
  low_stock: "bg-red-50 text-red-700",
  machine_down: "bg-rose-50 text-rose-700",
  pending_approval: "bg-purple-50 text-purple-700",
  leave_request: "bg-amber-50 text-amber-700",
  payment_due: "bg-orange-50 text-orange-700",
  order_delay: "bg-yellow-50 text-yellow-800",
  maintenance_due: "bg-sky-50 text-sky-700",
};

export default function Navbar({ onMenuClick }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count: notificationCount, notifications, loading: notificationsLoading } = useNotifications();
  const [now, setNow] = useState(() => new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const page = getPageMeta(location.pathname, t);
  const displayName = user?.name || "Admin";
  const displayRole = user?.role || t("nav.superAdmin");
  const canViewAlerts = userCanAccess(user, "alerts");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  const dateLabel = now.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 lg:px-6 lg:py-3.5">
        <div className="flex min-w-0 flex-1 items-start gap-3 lg:max-w-[340px]">
          <button
            type="button"
            onClick={onMenuClick}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1E293B]">{page.title}</h1>
            {page.subtitle && (
              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block leading-snug">{page.subtitle}</p>
            )}
          </div>
        </div>

        <div className="order-3 w-full lg:order-none lg:flex-1 lg:max-w-xl">
          <GlobalSearch />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
              title={t("common.notifications")}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{t("common.notifications")}</p>
                  {canViewAlerts && (
                    <Link
                      to="/alerts"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      {t("common.viewAll")}
                    </Link>
                  )}
                </div>
                <ul className="max-h-72 overflow-y-auto py-1">
                  {notificationsLoading && notifications.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-slate-400">Loading…</li>
                  )}
                  {!notificationsLoading && notifications.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-slate-400">{t("common.noNotifications")}</li>
                  )}
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <Link
                        to={n.link || "/alerts"}
                        onClick={() => setShowNotifications(false)}
                        className="flex gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot(n.severity)}`} />
                        <span className="min-w-0">
                          {n.category_label && (
                            <span
                              className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                CATEGORY_COLORS[n.category] || "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {t(`common.notificationCategories.${n.category}`, n.category_label || n.category)}
                            </span>
                          )}
                          <p className="truncate text-sm font-medium text-slate-800">{n.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link
            to="/"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
            title={t("common.messages")}
          >
            <Mail className="h-5 w-5" />
          </Link>

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 sm:flex"
            title={t("common.fullscreen")}
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <div className="text-right">
              <p className="text-[10px] font-medium text-slate-500 leading-tight">{dateLabel}</p>
              <p className="text-sm font-bold tabular-nums text-[#1E293B]">{timeLabel}</p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50 sm:px-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-xs font-bold text-white">
                {displayName[0].toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
                <p className="text-[10px] text-slate-500">{displayRole}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl" onMouseLeave={() => setShowProfile(false)}>
                <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  <UserCircle className="h-4 w-4" /> {t("common.myAccount")}
                </Link>
                <button type="button" onClick={() => { logout(); navigate("/login"); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> {t("common.signOut")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

