import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Bot,
  Building2,
  CreditCard,
  Factory,
  FileText,
  HardDrive,
  Info,
  KeyRound,
  LifeBuoy,
  Package,
  Palette,
  Puzzle,
  ScrollText,
  Search,
  Settings,
  Shield,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { searchSettingsCategories } from "./settingsCatalog";
import { SettingsCard, SkeletonCards } from "./settingsUi";

const ICONS = {
  Building2,
  Users,
  Shield,
  CreditCard,
  Bot,
  Bell,
  Palette,
  Package,
  Factory,
  Wallet,
  FileText,
  Puzzle,
  KeyRound,
  HardDrive,
  ScrollText,
  LifeBuoy,
  Info,
};

export default function SettingsHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [ready] = useState(true);

  const results = useMemo(() => searchSettingsCategories(query), [query]);

  if (!ready) return <SkeletonCards />;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Settings
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              Manage your company, users, security, subscriptions, AI, and system preferences.
            </p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings — Password, Subscription, Users, Inventory, GST…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-800/40">
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">
            No settings match “{query}”
          </p>
          <p className="mt-1 text-sm text-slate-500">Try users, password, GST, or subscription.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 text-sm font-semibold text-teal-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {results.map((cat) => {
            const Icon = ICONS[cat.icon] || Settings;
            return (
              <SettingsCard
                key={cat.id}
                title={cat.title}
                description={cat.description}
                icon={Icon}
                soft={cat.soft}
                onClick={() => navigate(`/settings/${cat.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
