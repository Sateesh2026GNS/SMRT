import { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Info,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { getUsers } from "../../api/adminApi";

const ROWS_PER_PAGE_OPTIONS = [5, 7, 10, 25, 50];

export default function SettingsUsers() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id ?? 1;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({
    name: "",
    email: "",
    phone: "",
    team: "",
  });
  const [sort, setSort] = useState({ key: "full_name", dir: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  useEffect(() => {
    getUsers(tenantId)
      .then((r) => setUsers(r.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [tenantId]);

  const filtered = useMemo(() => {
    let list = [...users];
    if (search.name) {
      const q = search.name.toLowerCase();
      list = list.filter((u) =>
        (u.full_name || "").toLowerCase().includes(q)
      );
    }
    if (search.email) {
      const q = search.email.toLowerCase();
      list = list.filter((u) => (u.email || "").toLowerCase().includes(q));
    }
    if (search.phone) {
      const q = search.phone.toLowerCase();
      list = list.filter((u) =>
        String(u.phone || "").toLowerCase().includes(q)
      );
    }
    if (search.team) {
      const q = search.team.toLowerCase();
      list = list.filter((u) =>
        (u.team || "").toLowerCase().includes(q)
      );
    }
    const key = sort.key === "name" ? "full_name" : sort.key;
    list.sort((a, b) => {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [users, search, sort]);

  const total = filtered.length;
  const start = page * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const SortHeader = ({ colKey, label }) => (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() =>
          setSort((s) => ({
            key: colKey,
            dir: s.key === colKey && s.dir === "asc" ? "desc" : "asc",
          }))
        }
        className="flex items-center gap-1 text-left font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
        <span className="flex">
          <ChevronUp
            className={`h-3.5 w-3.5 ${
              sort.key === colKey && sort.dir === "asc"
                ? "text-teal-600"
                : "text-slate-400"
            }`}
          />
          <ChevronDown
            className={`-ml-2 h-3.5 w-3.5 ${
              sort.key === colKey && sort.dir === "desc"
                ? "text-teal-600"
                : "text-slate-400"
            }`}
          />
        </span>
      </button>
      <input
        type="text"
        placeholder="Q Search"
        value={search[colKey] ?? ""}
        onChange={(e) =>
          setSearch((s) => ({ ...s, [colKey]: e.target.value }))
        }
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs placeholder-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <Info className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Section: Users */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Users
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage users of company
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Add Users
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-sky-50 dark:bg-sky-900/20">
              <th className="border-b border-slate-200 px-4 py-3 text-left dark:border-slate-700">
                <SortHeader colKey="name" label="Name" />
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left dark:border-slate-700">
                <SortHeader colKey="email" label="Email Id" />
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left dark:border-slate-700">
                <SortHeader colKey="phone" label="Phone Number" />
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left dark:border-slate-700">
                <SortHeader colKey="team" label="Team" />
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-700/50 dark:hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200">
                    {u.full_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {u.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {u.team}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            {ROWS_PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {total === 0
              ? "0 to 0 of 0"
              : `${start + 1} to ${Math.min(start + rowsPerPage, total)} of ${total}`}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
            >
              «
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
            >
              ‹
            </button>
            <button
              type="button"
              className="rounded bg-slate-200 px-2 py-1 text-sm font-medium dark:bg-slate-600"
            >
              {page + 1}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
