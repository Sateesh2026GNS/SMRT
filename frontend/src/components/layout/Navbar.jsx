import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  ChevronDown,
  LogOut,
  Maximize2,
  Menu,
  Minimize2,
  UserCircle,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { userCanAccess } from "../../config/permissions";
import GlobalSearch from "../common/GlobalSearch";
import NotificationBell from "../notifications/NotificationBell";

function getPageMeta(pathname, user, t) {
  if (pathname === "/") {
    const roleLabel = user?.role || "User";
    return {
      title: t("nav.dashboard"),
      subtitle: `Welcome ${roleLabel}`,
    };
  }
  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const title = segment.charAt(0).toUpperCase() + segment.replace(/-/g, " ").slice(1);
  return { title, subtitle: null };
}

export default function Navbar({ onMenuClick }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const profileRef = useRef(null);

  const page = getPageMeta(location.pathname, user, t);
  const displayName = user?.name || "Admin";
  const displayRole = user?.role || t("nav.superAdmin");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!showProfile) return undefined;
    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showProfile]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Browser may block fullscreen without a direct user gesture.
    }
  };

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
          <NotificationBell />



          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 sm:flex"
            title={isFullscreen ? t("common.exitFullscreen", { defaultValue: "Exit fullscreen" }) : t("common.fullscreen")}
            aria-label={isFullscreen ? t("common.exitFullscreen", { defaultValue: "Exit fullscreen" }) : t("common.fullscreen")}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <Calendar className="h-4 w-4 text-[#2563EB]" />
            <div className="text-right">
              <p className="text-[10px] font-medium text-slate-500 leading-tight">{dateLabel}</p>
              <p className="text-sm font-bold tabular-nums text-[#1E293B]">{timeLabel}</p>
            </div>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
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
              <div className="absolute right-0 top-full z-50 w-52 pt-1">
                <div className="rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                <Link to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  <UserCircle className="h-4 w-4" /> {t("common.myAccount")}
                </Link>
                <button type="button" onClick={() => { logout(); navigate("/login"); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> {t("common.signOut")}
                </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
