import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import { createMachine } from "../../api/productionApi";
import useTenantId from "../../hooks/useTenantId";



const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const STATUSES = ["idle", "running", "down", "maintenance"];

export default function CreateMachine() {
  const tenantId = useTenantId();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    name: "",
    status: "idle",
    location: "",
    is_active: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createMachine({
        tenant_id: tenantId,
        code: form.code.trim(),
        name: form.name.trim(),
        status: form.status,
        location: form.location.trim() || null,
        is_active: form.is_active,
      });
      navigate("/production/machines");
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;
      const status = err.response?.status;
      if (status === 422) {
        const errors = err.response?.data?.errors;
        setError(Array.isArray(errors) ? errors.join(", ") : "Validation error — check all fields.");
      } else if (status === 409) {
        setError("A machine with this code already exists.");
      } else if (detail) {
        setError(detail);
      } else {
        setError("Save failed. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        to="/production/machines"
        className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("production.backToMachineStatus", { defaultValue: "Back to machine status" })}
      </Link>
      <PageHeader
        title={t("production.newMachine", { defaultValue: "New machine" })}
        subtitle={t("production.newMachineSubtitle", {
          defaultValue: "Register a machine to monitor availability and status on the floor.",
        })}
      />
      <form onSubmit={handleSubmit} className="ui-card space-y-4 p-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("production.machineCode", { defaultValue: "Machine code" })} *
          <input
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="e.g. CNC-01"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("production.machineName", { defaultValue: "Name" })} *
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. CNC Mill 1"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("dashboard.status", { defaultValue: "Status" })}
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("production.location", { defaultValue: "Location" })}
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder={t("production.locationPlaceholder", { defaultValue: "e.g. Hall A" })}
            className={inputClass}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          {t("production.machineActive", { defaultValue: "Active" })}
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className="ui-btn-primary disabled:opacity-50">
            {saving ? t("common.saving", { defaultValue: "Saving…" }) : t("production.addMachine", { defaultValue: "Add machine" })}
          </button>
          <Link
            to="/production/machines"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Link>
        </div>
      </form>
    </div>
  );
}