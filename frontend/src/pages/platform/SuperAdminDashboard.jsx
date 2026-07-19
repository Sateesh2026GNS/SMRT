import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  LogOut,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";

import BrandLogo from "../../components/common/BrandLogo";
import PlatformProtectedRoute from "../../components/layout/PlatformProtectedRoute";
import {
  activateCompany,
  clearPlatformSession,
  deleteCompany,
  listCompanies,
  suspendCompany,
} from "../../api/platformApi";

function StatusBadge({ status }) {
  const colors = {
    active: "bg-green-100 text-green-700",
    suspended: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {status || "unknown"}
    </span>
  );
}

function SuperAdminDashboardContent() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    clearPlatformSession();
    navigate("/gns-admin/login", { replace: true });
  };

  const handleActivate = async (id) => {
    await activateCompany(id);
    load();
  };

  const handleSuspend = async (id) => {
    await suspendCompany(id);
    load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete company "${name}"? This cannot be undone.`)) return;
    await deleteCompany(id);
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">GNS Admin Portal</h1>
              <p className="text-xs text-slate-500">Super Admin — Company Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Companies</h2>
            <p className="text-sm text-slate-500">Provision and manage tenant companies</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              to="/gns-admin/companies/new"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Create Company
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Company ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Company</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Admin</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Plan</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Users</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading companies...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No companies yet. Create your first company.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {c.company_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="font-medium text-slate-900">{c.company_name}</p>
                          <p className="text-xs text-slate-500">{c.company_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{c.admin_name || "—"}</p>
                      <p className="text-xs text-slate-400">{c.admin_email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.subscription_plan || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {c.user_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/gns-admin/companies/${c.id}`}
                          className="rounded px-2 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50"
                        >
                          View
                        </Link>
                        {c.status === "suspended" ? (
                          <button
                            type="button"
                            onClick={() => handleActivate(c.id)}
                            className="rounded p-1 text-green-600 hover:bg-green-50"
                            title="Activate"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSuspend(c.id)}
                            className="rounded p-1 text-amber-600 hover:bg-amber-50"
                            title="Suspend"
                          >
                            <PauseCircle className="h-4 w-4" />
                          </button>
                        )}
                        {c.id !== 1 && (
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.company_name)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <PlatformProtectedRoute>
      <SuperAdminDashboardContent />
    </PlatformProtectedRoute>
  );
}
