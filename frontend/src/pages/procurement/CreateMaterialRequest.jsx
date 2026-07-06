import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import { createMaterialRequest } from "../../api/procurementApi";
import useTenantId from "../../hooks/useTenantId";



const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const STATUSES = ["pending", "approved", "rejected", "fulfilled"];

export default function CreateMaterialRequest() {
  const tenantId = useTenantId();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenant_id: tenantId,
    mr_number: "",
    request_date: new Date().toISOString().slice(0, 10),
    required_date: "",
    requested_by: "",
    status: "pending",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createMaterialRequest({
        ...form,
        mr_number: form.mr_number || `MR-${Date.now()}`,
        required_date: form.required_date || null,
        requested_by: form.requested_by || null,
        notes: form.notes || null,
        line_items: [],
      });
      navigate("/procurement/material-requests");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to create material request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        to="/procurement/material-requests"
        className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to material requests
      </Link>
      <PageHeader
        title="New material request"
        subtitle="Create a material request. You can add line items later."
      />
      <form onSubmit={handleSubmit} className="ui-card space-y-4 p-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          MR number
          <input
            type="text"
            value={form.mr_number}
            onChange={(e) => setForm((f) => ({ ...f, mr_number: e.target.value }))}
            placeholder="Auto-generated if empty"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Request date *
            <input
              type="date"
              required
              value={form.request_date}
              onChange={(e) => setForm((f) => ({ ...f, request_date: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Required date
            <input
              type="date"
              value={form.required_date}
              onChange={(e) => setForm((f) => ({ ...f, required_date: e.target.value }))}
              className={inputClass}
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Requested by
          <input
            type="text"
            value={form.requested_by}
            onChange={(e) => setForm((f) => ({ ...f, requested_by: e.target.value }))}
            placeholder="e.g. Production team"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Status
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
          Notes
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={inputClass}
          />
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className="ui-btn-primary disabled:opacity-50">
            {saving ? "Saving…" : "Create material request"}
          </button>
          <Link
            to="/procurement/material-requests"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}