import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wallet,
} from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { ImportExportActionBar } from "../../components/common/PageActionBar";
import CustomerDetailModal, { CustomerFormModal } from "../../components/sales/CustomerDetailModal";
import { useToast } from "../../context/ToastContext";
import useTenantId from "../../hooks/useTenantId";
import { getCustomers, createCustomer } from "../../api/salesApi";
import {
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
  DEMO_CUSTOMERS,
  IMPORT_TEMPLATE_HEADERS,
  INDIAN_STATES,
  REPORT_TYPES,
  SALES_EXECUTIVES,
  WORKFLOW_STEPS,
  computeCustomerSummary,
  enrichApiCustomer,
} from "../../data/customersMasterData";
import { exportToExcel, exportToPdf } from "../../utils/exportUtils";
import { parseImportFile } from "../../utils/importUtils";

function SummaryCard({ label, value, icon: Icon, color, format }) {
  const display = format === "currency" ? `₹${Number(value || 0).toLocaleString("en-IN")}` : value;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{display}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const active = status === "active";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
      active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
    }`}>
      {status}
    </span>
  );
}

const defaultFilters = {
  customer_code: "",
  company: "",
  contact: "",
  gstin: "",
  state: "",
  city: "",
  status: "",
  customer_type: "",
  sales_executive: "",
  date_from: "",
  date_to: "",
};

export default function Customers() {
  const { addToast } = useToast();
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formCustomer, setFormCustomer] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      const apiRows = res.data || [];
      if (apiRows.length > 0) {
        const enriched = apiRows.map((row, i) => enrichApiCustomer(row, i));
        const demoNames = new Set(DEMO_CUSTOMERS.map((c) => c.company));
        setCustomers([
          ...DEMO_CUSTOMERS,
          ...enriched.filter((c) => !demoNames.has(c.company)),
        ]);
      } else {
        setCustomers(DEMO_CUSTOMERS);
      }
    } catch {
      setCustomers(DEMO_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (filters.customer_code && !c.customer_code.toLowerCase().includes(filters.customer_code.toLowerCase())) return false;
      if (filters.company && !c.company.toLowerCase().includes(filters.company.toLowerCase())) return false;
      if (filters.contact && !c.contact_person.toLowerCase().includes(filters.contact.toLowerCase())) return false;
      if (filters.gstin && !String(c.gstin).toLowerCase().includes(filters.gstin.toLowerCase())) return false;
      if (filters.state && c.state !== filters.state) return false;
      if (filters.city && !c.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.customer_type && c.customer_type !== filters.customer_type) return false;
      if (filters.sales_executive && c.sales_executive !== filters.sales_executive) return false;
      if (filters.date_from && c.created_at && c.created_at < filters.date_from) return false;
      if (filters.date_to && c.created_at && c.created_at > filters.date_to) return false;
      return true;
    });
  }, [customers, filters]);

  const summary = useMemo(() => computeCustomerSummary(filteredCustomers), [filteredCustomers]);

  const cities = useMemo(() => [...new Set(customers.map((c) => c.city).filter(Boolean))], [customers]);

  const exportColumns = [
    { key: "customer_code", label: "Customer Code" },
    { key: "company", label: "Company" },
    { key: "contact_person", label: "Contact Person" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "gstin", label: "GSTIN" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "credit_limit", label: "Credit Limit" },
    { key: "outstanding", label: "Outstanding" },
    { key: "status", label: "Status" },
  ];

  const handleExportExcel = () => {
    exportToExcel(filteredCustomers, exportColumns, "customers");
    addToast("Exported to Excel");
  };

  const handleExportPdf = () => {
    exportToPdf(filteredCustomers, exportColumns, "Customer Master", "customers");
    addToast("Exported to PDF");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const rowsHtml = filteredCustomers.map((customer) => {
      const row = [
        customer.customer_code || "—",
        customer.company || "—",
        customer.contact_person || "—",
        customer.phone || "—",
        customer.email || "—",
        customer.gstin || "—",
        customer.city || "—",
        customer.state || "—",
        customer.credit_limit != null ? `₹${Number(customer.credit_limit).toLocaleString("en-IN")}` : "—",
        customer.outstanding != null ? `₹${Number(customer.outstanding).toLocaleString("en-IN")}` : "—",
        customer.status || "—",
      ];
      return `<tr>${row.map((value) => `<td>${String(value)}</td>`).join("")}</tr>`;
    }).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Master Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            p { margin: 0 0 16px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; }
            @media print { @page { margin: 15mm; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Customer Master Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table>
            <thead><tr><th>Customer Code</th><th>Company</th><th>Contact Person</th><th>Phone</th><th>Email</th><th>GSTIN</th><th>City</th><th>State</th><th>Credit Limit</th><th>Outstanding</th><th>Status</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadTemplate = () => {
    const header = IMPORT_TEMPLATE_HEADERS.join(",");
    const blob = new Blob([`${header}\nCUS006,Sample Corp,John Doe,+919999999999,john@sample.com,36AABCS1234A1Z1,Hyderabad,Telangana,500000,active`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customers_import_template.csv";
    a.click();
    addToast("Template downloaded");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const rows = await parseImportFile(file);
        if (!rows.length) { addToast("No data rows found in file", "error"); return; }
        const newCustomers = rows.map((row, i) =>
          enrichApiCustomer(
            { ...row, id: `import-${Date.now()}-${i}`, name: row.company || row.name },
            customers.length + i
          )
        );
        setCustomers((prev) => {
          const existingCodes = new Set(prev.map((c) => c.customer_code));
          const fresh = newCustomers.filter((c) => !existingCodes.has(c.customer_code));
          return [...prev, ...fresh];
        });
        addToast(`✅ Imported ${newCustomers.length} customer(s) from ${file.name}`, "success");
      } catch {
        addToast("Failed to parse file. Please use the template format.", "error");
      }
    };
    input.click();
  };

  const handleSave = async (form) => {
    const payload = {
      tenant_id: tenantId,
      name: form.company,
      contact_name: form.contact_person,
      phone: form.phone,
      email: form.email,
      gstin: form.gstin,
      state: form.state,
      address_line1: form.billing_address,
    };
    try {
      if (formCustomer?.id && typeof formCustomer.id === "number") {
        addToast("Update API not available — saved locally");
      } else {
        await createCustomer(payload);
        addToast("Customer created");
        loadCustomers();
        setFormCustomer(null);
        return;
      }
    } catch {
      /* fall through to local */
    }
    if (formCustomer?.id) {
      setCustomers((prev) => prev.map((c) => (c.id === formCustomer.id ? { ...c, ...form, company: form.company, name: form.company } : c)));
      addToast("Customer updated");
    } else {
      const newC = {
        ...enrichApiCustomer({ id: `new-${Date.now()}`, name: form.company, ...payload }, customers.length),
        id: `new-${Date.now()}`,
        customer_code: `CUS${String(customers.length + 1).padStart(3, "0")}`,
        ...form,
        company: form.company,
        name: form.company,
        created_at: new Date().toISOString().slice(0, 10),
      };
      setCustomers((prev) => [...prev, newC]);
      addToast("Customer added");
    }
    setFormCustomer(null);
  };

  const handleDelete = (customer) => {
    if (!window.confirm(`Delete ${customer.company}?`)) return;
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    setSelected(null);
    addToast("Customer deleted");
  };

  const columns = [
    { key: "customer_code", label: "Customer Code" },
    { key: "company", label: "Company" },
    { key: "contact_person", label: "Contact Person" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "gstin", label: "GSTIN" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    {
      key: "credit_limit",
      label: "Credit Limit",
      render: (r) => `₹${Number(r.credit_limit || 0).toLocaleString("en-IN")}`,
    },
    {
      key: "outstanding",
      label: "Outstanding",
      render: (r) => `₹${Number(r.outstanding || 0).toLocaleString("en-IN")}`,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusPill status={r.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1 text-xs">
          <button type="button" onClick={() => setSelected(r)} className="font-semibold text-[#2563EB] hover:underline">View</button>
          <button type="button" onClick={() => setFormCustomer(r)} className="font-semibold text-slate-600 hover:underline">Edit</button>
          <button type="button" onClick={() => handleDelete(r)} className="font-semibold text-red-600 hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader label="Loading customers..." />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customers, credit limits, outstanding balances, and sales relationships.
          </p>
        </div>
        <ImportExportActionBar
          onImport={handleImport}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          onRefresh={loadCustomers}
          importLabel="Import Customers"
          exportExcelLabel="Export Excel"
          exportPdfLabel="Export PDF"
          printLabel="Print"
          refreshLabel="Refresh"
          importIcon={Upload}
          exportExcelIcon={Download}
          exportPdfIcon={FileText}
          printIcon={Printer}
          refreshIcon={RefreshCw}
        >
          <button type="button" onClick={() => setFormCustomer({})} className="ui-btn-primary">
            <Plus className="h-4 w-4" /> New Customer
          </button>
        </ImportExportActionBar>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Customers" value={summary.total} icon={Users} color="bg-[#2563EB]" />
        <SummaryCard label="Active Customers" value={summary.active} icon={UserCheck} color="bg-green-500" />
        <SummaryCard label="Inactive Customers" value={summary.inactive} icon={UserX} color="bg-slate-500" />
        <SummaryCard label="New Customers (This Month)" value={summary.newThisMonth} icon={UserPlus} color="bg-purple-500" />
        <SummaryCard label="Pending Payments" value={summary.pendingPayments} icon={AlertCircle} color="bg-orange-500" />
        <SummaryCard label="Outstanding Amount" value={summary.outstandingAmount} icon={Wallet} color="bg-red-500" format="currency" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <input type="search" placeholder="Search Customer" value={filters.customer_code} onChange={(e) => setFilters((f) => ({ ...f, customer_code: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Company Name" value={filters.company} onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Contact Person" value={filters.contact} onChange={(e) => setFilters((f) => ({ ...f, contact: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="GSTIN" value={filters.gstin} onChange={(e) => setFilters((f) => ({ ...f, gstin: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={filters.state} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">State</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">City</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Status</option>
            {CUSTOMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.customer_type} onChange={(e) => setFilters((f) => ({ ...f, customer_type: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Customer Type</option>
            {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.sales_executive} onChange={(e) => setFilters((f) => ({ ...f, sales_executive: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Sales Executive</option>
            {SALES_EXECUTIVES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <input type="date" value={filters.date_from} onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" title="From date" />
          <input type="date" value={filters.date_to} onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" title="To date" />
          <button type="button" onClick={() => setFilters(defaultFilters)} className="text-sm font-semibold text-[#2563EB] hover:underline">
            Reset Filters
          </button>
        </div>

        <DataTable
          columns={columns}
          data={filteredCustomers}
          searchPlaceholder="Search Customer"
          searchKeys={["customer_code", "company", "contact_person", "email", "phone", "gstin", "city"]}
          pageSize={10}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Reports</h3>
          <ul className="space-y-2">
            {REPORT_TYPES.map((r) => (
              <li key={r}>
                <button type="button" onClick={() => addToast(`${r} — coming soon`, "info")} className="text-sm font-medium text-[#2563EB] hover:underline">
                  {r}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Customer Workflow</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            {WORKFLOW_STEPS.map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[#2563EB]">{step}</span>
                {i < arr.length - 1 && <span className="text-slate-300">↓</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <CustomerDetailModal
          customer={selected}
          onClose={() => setSelected(null)}
          onEdit={(c) => { setSelected(null); setFormCustomer(c); }}
          onDelete={handleDelete}
        />
      )}

      {formCustomer && (
        <CustomerFormModal
          customer={formCustomer}
          onClose={() => setFormCustomer(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
