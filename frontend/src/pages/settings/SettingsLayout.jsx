import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Users,
  Building2,
  Shield,
  CreditCard,
  Bell,
  FileText,
  Package,
  Factory,
  Truck,
  HelpCircle,
  ArrowLeft,
  Landmark,
  Receipt,
  Percent,
  Hash,
  PackageCheck,
  FileStack,
} from "lucide-react";

import useSettings from "../../context/SettingsContext";
import useAuth from "../../hooks/useAuth";

const SIDEBAR_SECTIONS = [
  {
    key: "user-management",
    label: "User Management",
    icon: Users,
    open: true,
    items: [
      { to: "/settings/users", label: "Users" },
      { to: "/settings/teams", label: "Teams" },
    ],
  },
  {
    key: "addresses",
    label: "Addresses",
    icon: Building2,
    items: [
      { to: "/settings/addresses/billing", label: "Billing Address", icon: FileText },
      { to: "/settings/addresses/delivery", label: "Delivery Location", icon: Truck },
    ],
  },
  { key: "permissions", label: "My Permissions", icon: Shield, to: "/settings/permissions" },
  { key: "subscription", label: "My Subscription", icon: CreditCard, to: "/settings/subscription" },
  { key: "alerts", label: "Alerts & Preferences", icon: Bell, to: "/settings/alerts" },
  {
    key: "accounts",
    label: "Accounts",
    icon: FileText,
    items: [
      { to: "/settings/accounts/bank-details", label: "Bank Details", icon: Landmark },
      { to: "/settings/accounts/payment-terms", label: "Payment Terms", icon: Receipt },
      { to: "/settings/accounts/tax-options", label: "Tax Options", icon: Percent },
    ],
  },
  {
    key: "documents",
    label: "Documents",
    icon: FileText,
    items: [
      { to: "/settings/documents/logistic-details", label: "Logistic Details", icon: Truck },
      { to: "/settings/documents/terms-conditions", label: "Terms & Conditions", icon: FileText },
      { to: "/settings/documents/number-format", label: "Document Number Format", icon: Hash },
      { to: "/settings/documents/package-type", label: "Package Type Master", icon: PackageCheck },
      { to: "/settings/documents/transporter", label: "Transporter Details", icon: Truck },
      { to: "/settings/documents/custom-fields", label: "Custom Fields", icon: FileStack },
      { to: "/settings/documents/excel", label: "Excel Documents", icon: FileText, pro: true },
    ],
  },
  { key: "inventory", label: "Inventory", icon: Package, to: "/settings/inventory" },
  { key: "production", label: "Production", icon: Factory, to: "/settings/production" },
  { key: "buyers", label: "Buyers & Suppliers", icon: Truck, to: "/settings/buyers" },
  { key: "gst", label: "GST API", icon: FileText, to: "/settings/gst" },
];

export default function SettingsLayout() {
  const { companyName } = useSettings();
  const { user } = useAuth();
  const tenantName = user?.tenant_name || companyName;
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState({
    "user-management": true,
    addresses: pathname.startsWith("/settings/addresses"),
    accounts: pathname.startsWith("/settings/accounts"),
    documents: pathname.startsWith("/settings/documents"),
  });
  const [sidebarSearch, setSidebarSearch] = useState("");

  const toggleSection = (key) => {
    setSidebarOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (pathname.startsWith("/settings/addresses")) {
      setSidebarOpen((prev) => ({ ...prev, addresses: true }));
    }
    if (pathname.startsWith("/settings/accounts")) {
      setSidebarOpen((prev) => ({ ...prev, accounts: true }));
    }
    if (pathname.startsWith("/settings/documents")) {
      setSidebarOpen((prev) => ({ ...prev, documents: true }));
    }
  }, [pathname]);

  const filterLabel = (label) =>
    !sidebarSearch.trim() || label.toLowerCase().includes(sidebarSearch.trim().toLowerCase());

  return (
    <div className="flex h-[calc(100vh-0px)] bg-slate-100 dark:bg-slate-900">
      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between bg-slate-800 px-6 shadow">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-slate-300" />
          <span className="text-lg font-semibold text-white">Settings</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <span className="truncate max-w-[180px]">{tenantName}</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </header>

      <aside className="fixed left-0 top-14 z-20 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/95">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Q Search"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200"
            />
          </div>
        </div>
        <nav className="space-y-0.5 px-2 pb-4">
          {SIDEBAR_SECTIONS.map((section) => {
            const Icon = section.icon;
            const hasItems = section.items?.length > 0;
            const hasLink = section.to;
            const isOpen = sidebarOpen[section.key] ?? false;

            if (hasItems) {
              const visibleItems = section.items.filter((i) => filterLabel(i.label));
              if (sidebarSearch.trim() && visibleItems.length === 0) return null;
              const isSectionActive = section.items?.some((i) => pathname === i.to);
              return (
                <div key={section.key}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50 ${
                      isSectionActive ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-slate-500" />
                      {section.label}
                    </span>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-slate-600">
                      {(sidebarSearch.trim() ? visibleItems : section.items).map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                isActive
                                  ? "bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                              }`
                            }
                          >
                            {ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                            {item.label}
                            {item.pro && (
                              <span className="ml-auto rounded border border-teal-600 bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:border-teal-500 dark:bg-teal-900/30 dark:text-teal-400">
                                PRO
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (hasLink) {
              if (!filterLabel(section.label)) return null;
              return (
                <NavLink
                  key={section.key}
                  to={section.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  {section.label}
                </NavLink>
              );
            }
            return (
              <div key={section.key} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400">
                <Icon className="h-4 w-4 text-slate-500" />
                {section.label}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="ml-64 flex-1 overflow-auto pt-14">
        <div className="min-h-full bg-white p-6 dark:bg-slate-900">
          <Outlet />
        </div>
      </main>

      <a
        href="#"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-green-700"
        onClick={(e) => e.preventDefault()}
      >
        <HelpCircle className="h-4 w-4" />
        Get Help
      </a>
    </div>
  );
}
