import { useState } from "react";
import { Info, Check, Eye, Phone, GitCompare } from "lucide-react";

const PLANS = [
  { id: "free", name: "FREE", price: "₹0", billing: null },
  { id: "growth", name: "GROWTH", price: "₹36,000", billing: "Billed Quarterly Only" },
  { id: "scale", name: "SCALE", price: "₹1,50,000", billing: "Billed Annually Only" },
  { id: "dominate", name: "DOMINATE", price: "₹3,60,000", billing: "Billed Annually Only" },
];

const FREE_PLAN_FEATURES = [
  "Advanced Lead Management",
  "Inventory History",
  "30 Transaction/Month",
  "10+ Reports and Business Intelligence",
];

export default function SettingsMySubscription() {
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          My Subscription
        </h1>
        <Info className="h-4 w-4 text-slate-400" />
      </div>

      {/* Free Trial Banner */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-green-800 dark:text-green-400">
            Free Trial (5 days)
          </h2>
          <p className="mt-1 text-sm text-green-700 dark:text-green-500">
            Unlock all the features on GNS Insights with just one click!
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Activate Trial
        </button>
      </div>

      {/* Currently Active Plan */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Currently Active
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-teal-600 hover:underline dark:text-teal-400"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
        {showDetails && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Free Plan (₹0/year)
              </h3>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                Free forever
              </span>
            </div>
            <ul className="space-y-2">
              {FREE_PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Compare Plans and Pricing */}
      <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
        Compare Plans and Pricing
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              {plan.name}
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              {plan.price}
            </p>
            {plan.billing && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {plan.billing}
              </p>
            )}
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700/50"
              title="View details"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
          </div>
        ))}
      </div>

      {/* Bottom action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          <Phone className="h-4 w-4" />
          Talk to an expert
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800"
        >
          <GitCompare className="h-4 w-4" />
          Compare All Plans
        </button>
      </div>
    </div>
  );
}
