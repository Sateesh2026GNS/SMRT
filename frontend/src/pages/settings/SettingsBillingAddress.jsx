import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { useCompanySettings } from "../../hooks/useCompanySettings";

const FIELDS = [
  { key: "address_line1", label: "Address Line 1", full: true },
  { key: "address_line2", label: "Address Line 2", full: true },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "state_code", label: "State Code" },
  { key: "pincode", label: "Pincode" },
];

export default function SettingsBillingAddress() {
  const { settings, loading, saving, save } = useCompanySettings();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (settings) {
      const next = {};
      FIELDS.forEach(({ key }) => {
        next[key] = settings[key] ?? "";
      });
      setForm(next);
    }
  }, [settings]);

  const handleSave = async () => {
    const payload = {};
    FIELDS.forEach(({ key }) => {
      payload[key] = form[key]?.trim() || null;
    });
    await save(payload);
  };

  const formattedAddress = [
    form.address_line1,
    form.address_line2,
    [form.city, form.state, form.pincode].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Billing Address</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Company billing address used on invoices and tax documents.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      {formattedAddress && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Preview</p>
          <p className="mt-2 text-sm text-slate-700 whitespace-pre-line dark:text-slate-300">
            {formattedAddress}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map(({ key, label, full }) => (
            <div key={key} className={full ? "sm:col-span-2" : undefined}>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                {label}
              </label>
              <input
                type="text"
                value={form[key] ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
