import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  UserRound,
} from "lucide-react";

import BrandLogo from "../../components/common/BrandLogo";
import PlatformProtectedRoute from "../../components/layout/PlatformProtectedRoute";
import { createCompany } from "../../api/platformApi";

const PLANS = [
  { id: "trial", label: "Trial" },
  { id: "growth", label: "Growth" },
  { id: "scale", label: "Scale" },
  { id: "dominate", label: "Dominate" },
  { id: "enterprise", label: "Enterprise" },
];

const EMPTY = {
  company_name: "",
  company_email: "",
  admin_name: "",
  admin_email: "",
  mobile_number: "",
  gst_number: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pin_code: "",
  subscription_plan: "trial",
  trial_days: 5,
  password: "",
  confirm_password: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

function CreateCompanyForm() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await createCompany({
        ...form,
        trial_days: Number(form.trial_days),
        gst_number: form.gst_number || null,
      });
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to create company.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader />
        <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Company created successfully</h2>
            <p className="mt-2 text-sm text-slate-600">{result.message}</p>

            <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 text-left text-sm">
              <Row label="Company ID" value={result.company_id} mono />
              <Row label="Admin Email" value={result.admin_email} />
              <Row label="Temporary Password" value={result.temporary_password} mono />
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Login details have been emailed to the company admin.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                to="/gns-admin"
                className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Back to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setForm(EMPTY);
                }}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Create Another
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <PageHeader />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          to="/gns-admin"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to companies
        </Link>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create New Company</h2>
          <p className="mt-1 text-sm text-slate-500">
            Provision a tenant, company admin account, subscription, and license.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form id="create-company-form" onSubmit={handleSubmit} className="space-y-5">
          <Section
            icon={Building2}
            title="Company Details"
            subtitle="Legal and contact information for the tenant organization."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company Name" required value={form.company_name} onChange={set("company_name")} placeholder="Acme Manufacturing Pvt Ltd" />
              <Field label="Company Email" type="email" required value={form.company_email} onChange={set("company_email")} placeholder="admin@company.com" />
              <Field label="Mobile Number" required value={form.mobile_number} onChange={set("mobile_number")} placeholder="9876543210" />
              <Field label="GST Number" value={form.gst_number} onChange={set("gst_number")} placeholder="Optional" />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={set("address")}
                  required
                  rows={2}
                  placeholder="Street, area, landmark"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <Field label="City" required value={form.city} onChange={set("city")} />
              <Field label="State" required value={form.state} onChange={set("state")} />
              <Field label="Country" required value={form.country} onChange={set("country")} />
              <Field label="PIN Code" required value={form.pin_code} onChange={set("pin_code")} />
            </div>
          </Section>

          <Section
            icon={UserRound}
            title="Company Admin"
            subtitle="First administrator who will manage users for this company."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Admin Name" required value={form.admin_name} onChange={set("admin_name")} placeholder="Full name" />
              <Field label="Admin Email" type="email" required value={form.admin_email} onChange={set("admin_email")} placeholder="admin@company.com" />
            </div>
          </Section>

          <Section
            icon={CreditCard}
            title="Subscription"
            subtitle="Choose the plan and trial window for this company."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Plan <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.subscription_plan}
                  onChange={set("subscription_plan")}
                  className={inputClass}
                  required
                >
                  {PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Trial Days"
                type="number"
                min={0}
                max={365}
                required
                value={form.trial_days}
                onChange={set("trial_days")}
              />
            </div>
          </Section>

          <Section
            icon={KeyRound}
            title="Admin Password"
            subtitle="Temporary password shared with the company admin after creation."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                label="Password"
                required
                value={form.password}
                onChange={set("password")}
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
              <PasswordField
                label="Confirm Password"
                required
                value={form.confirm_password}
                onChange={set("confirm_password")}
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />
            </div>
          </Section>
        </form>
      </main>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="hidden text-xs text-slate-500 sm:block">
            Company ID and login credentials will be emailed to the admin.
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              to="/gns-admin"
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex-none"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="create-company-form"
              disabled={loading}
              className="flex-1 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 sm:flex-none"
            >
              {loading ? "Creating…" : "Create Company"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3.5 sm:px-6">
        <BrandLogo size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">GNS Admin Portal</p>
          <p className="text-xs text-slate-500">Company provisioning</p>
        </div>
      </div>
    </header>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="h-4.5 w-4.5 h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, required, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input {...props} required={required} className={inputClass} />
    </div>
  );
}

function PasswordField({ label, required, value, onChange, visible, onToggle }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete="new-password"
          className={`${inputClass} pr-11`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-slate-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default function CreateCompany() {
  return (
    <PlatformProtectedRoute>
      <CreateCompanyForm />
    </PlatformProtectedRoute>
  );
}
