import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Filter, LayoutGrid, List, Plus, RefreshCw, Target, TrendingUp, UserPlus, Users, XCircle } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import RowActionMenu from "../../components/common/RowActionMenu";
import Loader from "../../components/common/Loader";
import LeadDetailModal from "../../components/sales/LeadDetailModal";
import { useToast } from "../../context/ToastContext";
import { getLeadSummary, getLeadsEnriched, updateLeadStatus, createLead } from "../../api/salesApi";
import {
  DEMO_LEAD_LIST,
  DEMO_LEAD_SUMMARY,
  KANBAN_COLUMNS,
  LEAD_INDUSTRIES,
  LEAD_REGIONS,
  LEAD_SOURCES,
  formatInr,
  priorityColor,
  statusColor,
} from "../../data/salesMasterData";

function KpiCard({ label, value, icon: Icon, color, suffix }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}{suffix || ""}</p>
        </div>
        {Icon && <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5 text-white" /></div>}
      </div>
    </div>
  );
}

const defaultFilters = { sales_executive: "", source: "", industry: "", region: "", status: "", priority: "" };

export default function Leads() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEMO_LEAD_SUMMARY);
  const [rows, setRows] = useState(DEMO_LEAD_LIST);
  const [filters, setFilters] = useState(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [view, setView] = useState("table");
  const [selected, setSelected] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "Web Search",
    status: "new",
    priority: "medium",
    opportunity_value: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.allSettled([getLeadSummary(), getLeadsEnriched()]);
      if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary({ ...DEMO_LEAD_SUMMARY, ...sumRes.value.data });
      if (listRes.status === "fulfilled" && listRes.value?.data) {
        const apiLeads = listRes.value.data;
        if (apiLeads.length > 0) {
          setRows([
            ...apiLeads,
            ...DEMO_LEAD_LIST.filter((d) => !apiLeads.some((r) => r.company === d.company)),
          ]);
        } else {
          setRows(DEMO_LEAD_LIST);
        }
      } else {
        setRows(DEMO_LEAD_LIST);
      }
    } catch {
      addToast("Using demo lead data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);


  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createLead({
        tenant_id: 1,
        ...newLead,
        opportunity_value: newLead.opportunity_value ? Number(newLead.opportunity_value) : 0,
      });
      addToast("Lead created successfully", "success");
      setShowCreate(false);
      setNewLead({
        name: "",
        company: "",
        email: "",
        phone: "",
        source: "Web Search",
        status: "new",
        priority: "medium",
        opportunity_value: "",
        notes: "",
      });
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || "Creation failed", "error");
    }
  };

  const filtered = useMemo(() => {
    let list = rows;
    Object.entries(filters).forEach(([k, v]) => {
      if (!v) return;
      list = list.filter((r) => String(r[k] || "").toLowerCase().includes(v.toLowerCase()));
    });
    return list;
  }, [rows, filters]);

  const handleStatus = async (lead, status) => {
    if (typeof lead.id === "number") {
      try {
        await updateLeadStatus(lead.id, status);
        addToast("Lead updated");
        load();
      } catch (err) {
        addToast(err.response?.data?.detail || "Update failed", "error");
        return;
      }
    } else {
      addToast(`Lead marked as ${status} (demo)`);
    }
    setSelected(null);
  };

  const columns = [
    { key: "lead_id", label: "Lead ID" },
    { key: "customer_name", label: "Customer" },
    { key: "company", label: "Company" },
    { key: "contact", label: "Contact" },
    { key: "source", label: "Source" },
    { key: "sales_executive", label: "Sales Executive" },
    { key: "priority", label: "Priority", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${priorityColor(r.priority)}`}>{r.priority}</span> },
    { key: "next_followup", label: "Next Follow-up", render: (r) => String(r.next_followup || "").slice(0, 10) || "—" },
    { key: "status", label: "Status", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span> },
    { key: "actions", label: "Actions", sortable: false, render: (r) => (
      <RowActionMenu
        rowId={r.id}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        items={[
          { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => setSelected(r) },
        ]}
      />
    )},
  ];

  if (loading) return <Loader label="Loading leads..." />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads (CRM)</h1>
          <p className="mt-1 text-sm text-slate-500">Enterprise CRM pipeline with Kanban view, 360° lead profile, and opportunity tracking.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowCreate(true)} className="ui-btn-primary"><Plus className="h-4 w-4" /> New Lead</button>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Leads" value={summary.total_leads} icon={Users} color="bg-blue-600" />
        <KpiCard label="New Leads" value={summary.new_leads} icon={UserPlus} color="bg-indigo-600" />
        <KpiCard label="Qualified" value={summary.qualified_leads} icon={Target} color="bg-purple-600" />
        <KpiCard label="Won Customers" value={summary.won_customers} icon={TrendingUp} color="bg-green-600" />
        <KpiCard label="Lost Leads" value={summary.lost_leads} icon={XCircle} color="bg-red-500" />
        <KpiCard label="Conversion Rate" value={summary.conversion_rate} suffix="%" icon={TrendingUp} color="bg-teal-600" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
        {["Lead", "Qualification", "Opportunity", "Quotation", "Sales Order"].map((s, i, arr) => (
          <span key={s} className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-2 py-1 shadow-sm">{s}</span>
            {i < arr.length - 1 && <span className="text-slate-400">↓</span>}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter className="h-4 w-4" /> Advanced Filters</button>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
            <button type="button" onClick={() => setView("table")} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "table" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}><List className="h-3.5 w-3.5" /> Table</button>
            <button type="button" onClick={() => setView("kanban")} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "kanban" ? "bg-white text-[#2563EB] shadow-sm" : "text-slate-500"}`}><LayoutGrid className="h-3.5 w-3.5" /> Kanban</button>
          </div>
        </div>

        {showAdvanced && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={filters.sales_executive} onChange={(e) => setFilters({ ...filters, sales_executive: e.target.value })} placeholder="Sales Executive" className="rounded-lg border px-3 py-2 text-sm" />
            <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Sources</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Industries</option>
              {LEAD_INDUSTRIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Regions</option>
              {LEAD_REGIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Status</option>
              {["new", "contacted", "qualified", "converted", "lost"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Priority</option>
              {["urgent", "high", "medium", "low"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {view === "table" ? (
          <DataTable columns={columns} data={filtered} searchPlaceholder="Search leads..." searchKeys={["customer_name", "company", "sales_executive"]} />
        ) : (
          <div className="grid gap-4 overflow-x-auto lg:grid-cols-5">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.id} className={`min-w-[200px] rounded-xl border p-3 ${col.color}`}>
                <p className="mb-2 text-xs font-bold uppercase text-slate-600">{col.label}</p>
                <div className="space-y-2">
                  {filtered.filter((r) => r.status === col.id).map((r) => (
                    <button key={r.lead_id} type="button" onClick={() => setSelected(r)} className="w-full rounded-lg bg-white p-3 text-left shadow-sm hover:shadow">
                      <p className="text-sm font-semibold text-slate-800">{r.customer_name}</p>
                      <p className="text-xs text-slate-500">{r.company}</p>
                      {r.opportunity_value && <p className="mt-1 text-xs font-bold text-[#2563EB]">{formatInr(r.opportunity_value)}</p>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <LeadDetailModal lead={selected} onClose={() => setSelected(null)} onStatusChange={handleStatus} />}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b px-5 py-4">
              <h2 className="text-xl font-bold text-slate-900">Create New Lead</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><XCircle className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Customer Name</label>
                <input required value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Company</label>
                  <input value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Opportunity Value</label>
                  <input type="number" value={newLead.opportunity_value} onChange={(e) => setNewLead({ ...newLead, opportunity_value: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. 50000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Email</label>
                  <input type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Phone</label>
                  <input value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="1234567890" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Source</label>
                  <select value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm bg-white font-medium text-slate-700">
                    {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select value={newLead.status} onChange={(e) => setNewLead({ ...newLead, status: e.target.value })} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm bg-white font-medium text-slate-700">
                    {["new", "contacted", "qualified", "converted", "lost"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Priority</label>
                  <select value={newLead.priority} onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm bg-white font-medium text-slate-700">
                    {["urgent", "high", "medium", "low"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Notes</label>
                <textarea value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={2} placeholder="Add any details..." />
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
