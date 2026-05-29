import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Package, FileText, BarChart3, ClipboardList, ShoppingCart, Receipt } from "lucide-react";

const defaultActions = [
  { to: "/production/work-orders/create-quick", icon: Plus, labelKey: "dashboard.createWorkOrder", primary: true },
  { to: "/production/create", icon: ClipboardList, labelKey: "dashboard.newProductionOrder" },
  { to: "/sales/orders/create", icon: Receipt, labelKey: "dashboard.newSalesOrder" },
  { to: "/procurement/purchase-orders/create", icon: ShoppingCart, labelKey: "dashboard.newPurchaseOrder" },
  { to: "/inventory/items/create", icon: Package, labelKey: "dashboard.newInventoryItem" },
  { to: "/sales/invoices", icon: FileText, labelKey: "dashboard.invoices" },
  { to: "/accounts", icon: BarChart3, labelKey: "dashboard.reports" },
  { to: "/production/planning", icon: ClipboardList, labelKey: "dashboard.productionPlanning" },
];

export default function QuickActions({ actions = defaultActions }) {
  const { t } = useTranslation();
  const primary = actions.find((a) => a.primary) || actions[0];
  const rest = actions.filter((a) => !a.primary);

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={primary.to}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)" }}
      >
        <primary.icon className="h-4 w-4 shrink-0" />
        {t(primary.labelKey)}
      </Link>
      {rest.map(({ to, icon: Icon, labelKey }) => (
        <Link
          key={to}
          to={to}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-900/20"
        >
          <Icon className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
          {t(labelKey)}
        </Link>
      ))}
    </div>
  );
}
