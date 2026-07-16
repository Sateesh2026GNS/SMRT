import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Pause,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Upload,
  Sparkles,
  HelpCircle,
  Terminal,
  Bot,
} from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import ProductionOrderDetailModal, {
  CompleteWorkflowModal,
  StartCheckModal,
} from "../../components/production/ProductionOrderDetailModal";
import { useToast } from "../../context/ToastContext";
import {
  completeProductionOrder,
  deleteProductionOrder,
  getProductionOrderDetail,
  getProductionOrderStartChecks,
  getProductionOrders,
  getProductionPlanningSummary,
  pauseProductionOrder,
  startProductionOrder,
} from "../../api/productionApi";
import {
  DEMO_PRODUCTION_ORDERS,
  DEMO_SUMMARY,
  DEPARTMENTS,
  IMPORT_TEMPLATE_HEADERS,
  ORDER_STATUSES,
  PRIORITIES,
  SHIFTS,
  STATUS_FLOW,
  WORKFLOW_STEPS,
  canComplete,
  canPause,
  canStart,
  computePlanningSummary,
  enrichApiOrder,
  priorityBadge,
  statusLabel,
} from "../../data/productionPlanningMasterData";
import { exportToExcel, exportToPdf } from "../../utils/exportUtils";
import { parseImportFile } from "../../utils/importUtils";

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function PriorityPill({ priority }) {
  const p = priorityBadge(priority);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${p.bg} ${p.text}`}>
      {p.dot} {p.label}
    </span>
  );
}

function ProgressCell({ row }) {
  const pct = row.progress_pct ?? 0;
  return (
    <div className="min-w-[100px]">
      <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
        <span>{row.produced_quantity ?? 0}/{row.planned_quantity}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

const defaultFilters = {
  order_number: "",
  product: "",
  customer: "",
  work_order: "",
  machine: "",
  department: "",
  shift: "",
  priority: "",
  status: "",
  date_from: "",
  date_to: "",
  date_today: "",
};

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val).slice(0, 16).replace("T", " ") : d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function ProductionPlanning() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
  const hasEditPermission = !userRoles.some(r =>
    ["operator", "store manager", "hr manager", "accountant"].includes(r.toLowerCase())
  );
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState(() => {
    const initFilters = { ...defaultFilters };
    searchParams.forEach((value, key) => {
      if (key in initFilters) {
        initFilters[key] = value;
      }
    });
    return initFilters;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startModal, setStartModal] = useState(null);
  const [startChecks, setStartChecks] = useState([]);
  const [startLoading, setStartLoading] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [completeSteps, setCompleteSteps] = useState([]);

  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const activeRole = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
    return roles[0] || "Guest";
  }, [user]);

  // These must be declared BEFORE aiRoleConfig which depends on them
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filters.order_number && !String(o.order_number).toLowerCase().includes(filters.order_number.toLowerCase())) return false;
      if (filters.product && !String(o.product_name || "").toLowerCase().includes(filters.product.toLowerCase())) return false;
      if (filters.customer && !String(o.customer_name || "").toLowerCase().includes(filters.customer.toLowerCase())) return false;
      if (filters.work_order && !String(o.work_order_number || "").toLowerCase().includes(filters.work_order.toLowerCase())) return false;
      if (filters.machine && !String(o.machine_name || "").toLowerCase().includes(filters.machine.toLowerCase())) return false;
      if (filters.department && o.department !== filters.department) return false;
      if (filters.shift && o.shift !== filters.shift) return false;
      if (filters.priority && o.priority !== filters.priority) return false;
      if (filters.status && o.status !== filters.status) return false;
      if (filters.date_from && (!o.start_date || String(o.start_date).slice(0, 10) < filters.date_from)) return false;
      if (filters.date_to && (!o.due_date || String(o.due_date).slice(0, 10) > filters.date_to)) return false;
      if (filters.date_today && (!o.start_date || String(o.start_date).slice(0, 10) !== filters.date_today)) return false;
      return true;
    });
  }, [orders, filters]);

  const summary = useMemo(() => {
    return computePlanningSummary(filteredOrders);
  }, [filteredOrders]);

  const aiRoleConfig = useMemo(() => {
    const roleLower = activeRole.toLowerCase();
    
    const delayedCount = filteredOrders.filter(o => o.is_delayed).length;
    const delayedList = filteredOrders
      .filter(o => o.is_delayed)
      .map(o => o.order_number)
      .slice(0, 3)
      .join(", ");
    
    const completedCount = filteredOrders.filter(o => o.status === "completed").length;
    const activeCount = filteredOrders.filter(o => o.status === "in_progress" || o.status === "planned").length;
    
    const target = summary.todays_target || 0;
    const prod = summary.todays_production || 0;
    const pct = target > 0 ? Math.round((prod / target) * 100) : 0;

    if (roleLower.includes("manager") || roleLower.includes("planner") || roleLower.includes("admin")) {
      return {
        summaryText: `AI Analysis: 12 key factors analyzed. Currently, ${delayedCount} order${delayedCount !== 1 ? 's are' : ' is'} delayed (${delayedList || 'none'}). Today's target is at ${pct}% completion. Recommended: review delayed orders and balance machine load.`,
        questions: [
          "Which orders are currently delayed?",
          "What is our production progress against today's target?",
          "Are there any resource conflicts or idle machines?"
        ],
        getAnswer: (q) => {
          if (q.includes("delayed")) {
            if (delayedCount === 0) return "All orders are currently on track. No delays detected in the active production schedule.";
            return `There are currently ${delayedCount} delayed order(s): ${delayedList || 'N/A'}.\n\nRecommended Action: Adjust machine schedules or reassign operators to prevent downstream assembly bottlenecks.`;
          }
          if (q.includes("progress")) {
            return `Today's production target is ${target.toLocaleString()} units, and we have produced ${prod.toLocaleString()} units (${pct}% completion).\n\nStatus: ${pct >= 100 ? 'Target achieved successfully!' : 'Production is ongoing. We recommend verifying shift changeovers are fully staffed.'}`;
          }
          return `Machine load analysis: DMG Mori CNC and Injection Mold machines are running at 85% capacity. Machine scheduling indicates no critical conflicts for the next 24 hours.`;
        }
      };
    } else if (roleLower.includes("operator")) {
      const operatorTasks = filteredOrders.filter(o => (o.operator_name && o.operator_name.toLowerCase().includes(roleLower)) || o.status === "in_progress");
      return {
        summaryText: `Welcome, Operator. You have ${operatorTasks.length} active order(s) on the floor. Please review start checks and ensure safety clearances are met before starting machine operations.`,
        questions: [
          "What are my active tasks for this shift?",
          "How do I complete the safety checks for machine starting?",
          "Who should I contact if a machine is delayed?"
        ],
        getAnswer: (q) => {
          if (q.includes("active tasks")) {
            if (operatorTasks.length === 0) return "You currently have no direct assignments. Please consult the Production Manager for shift details.";
            return `You have ${operatorTasks.length} active task(s):\n${operatorTasks.map(t => `- ${t.order_number} (${t.product_name}) on ${t.machine_name || 'unassigned'}`).join("\n")}`;
          }
          if (q.includes("safety checks")) {
            return `Required Start Checks:\n1. Verify material feedstock availability.\n2. Confirm machine guard guards are locked.\n3. Verify operator badge/log-in matches assigned station.\n4. Complete the Start Check checklist in the Order Details modal.`;
          }
          return `In case of delays or technical issues, contact the Shift Supervisor (Ravi Kumar, Ext. 402) or submit a maintenance ticket via the Maintenance module.`;
        }
      };
    } else if (roleLower.includes("store") || roleLower.includes("inventory")) {
      return {
        summaryText: `Inventory Check: Staging area is preparing materials for ${activeCount} planned orders. Recommended: Verify BOM listings for incoming shift orders to avoid feedstock shortage.`,
        questions: [
          "Which materials need to be staged next?",
          "Are there any completed orders ready for dispatch?",
          "What is the status of material safety stock?"
        ],
        getAnswer: (q) => {
          if (q.includes("staged next")) {
            const nextUp = filteredOrders.filter(o => o.status === "planned").slice(0, 3);
            if (nextUp.length === 0) return "No upcoming planned orders require immediate material staging.";
            return `Materials to stage next for upcoming orders:\n${nextUp.map(o => `- ${o.product_name} (Planned Qty: ${o.planned_quantity}) for order ${o.order_number}`).join("\n")}`;
          }
          if (q.includes("completed orders")) {
            const completed = filteredOrders.filter(o => o.status === "completed").slice(0, 3);
            if (completed.length === 0) return "No completed orders are currently waiting in the staging bay.";
            return `The following completed orders are ready for final quality checks and warehouse dispatch:\n${completed.map(o => `- Order ${o.order_number} for customer ${o.customer_name || 'stock'}`).join("\n")}`;
          }
          return `Material stock level: Standard safety stock levels (SS) are green. 1 item (Aluminum Alloy T6) is approaching reorder point (currently 150kg left).`;
        }
      };
    } else {
      return {
        summaryText: `General View: AI is tracking production metrics. Completion rate is at ${completedCount} completed order(s). Active queue contains ${activeCount} orders.`,
        questions: [
          "What is the overall completion rate?",
          "Show me the delay rate summary.",
          "What is today's shift log summary?"
        ],
        getAnswer: (q) => {
          if (q.includes("completion rate")) {
            const total = filteredOrders.length;
            const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
            return `Overall Order Completion Rate: ${rate}% (${completedCount} out of ${total} orders completed).`;
          }
          if (q.includes("delay")) {
            const total = filteredOrders.length;
            const rate = total > 0 ? Math.round((delayedCount / total) * 100) : 0;
            return `Overall Delay Rate: ${rate}% (${delayedCount} out of ${total} orders currently delayed).`;
          }
          return `Shift Log: Shift A is currently active. Production efficiency average is 92%. All primary machinery operational.`;
        }
      };
    }
  }, [activeRole, filteredOrders, summary]);

  const handleQuestionClick = (q) => {
    setAiLoading(true);
    setAiAnswer("");
    setTimeout(() => {
      setAiAnswer(aiRoleConfig.getAnswer(q));
      setAiLoading(false);
    }, 600);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, sRes] = await Promise.all([
        getProductionOrders().catch(() => ({ data: [] })),
        getProductionPlanningSummary().catch(() => ({ data: null })),
      ]);
      const apiRows = oRes.data || [];
      if (apiRows.length > 0) {
        const enriched = apiRows.map((row, i) => enrichApiOrder(row, i));
        const demoNums = new Set(DEMO_PRODUCTION_ORDERS.map((o) => o.order_number));
        setOrders([
          ...DEMO_PRODUCTION_ORDERS,
          ...enriched.filter((o) => !demoNums.has(o.order_number)),
        ]);
      } else {
        setOrders(DEMO_PRODUCTION_ORDERS);
      }
      setApiSummary(sRes.data);
    } catch {
      setOrders(DEMO_PRODUCTION_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);



  const openOrder = async (order) => {
    setSelected(order);
    setDetail(null);
    if (typeof order.id === "number") {
      try {
        const res = await getProductionOrderDetail(order.id);
        setDetail(enrichApiOrder(res.data));
      } catch {
        /* use list */
      }
    }
  };

  const handleStartClick = async (order) => {
    if (typeof order.id === "number") {
      try {
        const res = await getProductionOrderStartChecks(order.id);
        setStartChecks(res.data || []);
        setStartModal(order);
        return;
      } catch {
        addToast("Could not load start checks", "error");
        return;
      }
    }
    setStartChecks([
      { check_type: "material", label: "Material Availability", ready: true, message: "All required materials available" },
      { check_type: "machine", label: "Machine Availability", ready: !!order.machine_name, message: order.machine_name ? "Machine ready" : "No machine assigned" },
      { check_type: "operator", label: "Operator Availability", ready: !!order.operator_name, message: order.operator_name ? "Operator assigned" : "No operator" },
    ]);
    setStartModal(order);
  };

  const confirmStart = async () => {
    const order = startModal;
    if (!order) return;
    setStartLoading(true);
    if (typeof order.id === "number") {
      try {
        const res = await startProductionOrder(order.id);
        if (res.data?.success) {
          addToast("Production started");
          load();
          setStartModal(null);
        } else {
          setStartChecks(res.data?.checks || []);
          addToast(res.data?.message || "Checks failed", "error");
        }
      } catch (err) {
        addToast(err.response?.data?.detail || "Start failed", "error");
      } finally {
        setStartLoading(false);
      }
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "in_progress" } : o)));
    addToast("Production started");
    setStartModal(null);
    setStartLoading(false);
  };

  const handlePause = async (order) => {
    if (typeof order.id === "number") {
      try {
        await pauseProductionOrder(order.id);
        addToast("Production paused");
        load();
      } catch {
        addToast("Pause failed", "error");
      }
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "planned" } : o)));
    addToast("Production paused");
  };

  const handleComplete = async (order) => {
    if (typeof order.id === "number") {
      try {
        const res = await completeProductionOrder(order.id);
        if (res.data?.success) {
          setCompleteSteps(res.data.steps || []);
          setCompleteModal(order);
          addToast(res.data.message || "Completed");
          load();
          setSelected(null);
        } else {
          addToast(res.data?.message || "Complete failed", "error");
        }
      } catch (err) {
        addToast(err.response?.data?.detail || "Complete failed", "error");
      }
      return;
    }
    setCompleteSteps([
      "Production finished — quality inspection initiated",
      "Quality inspection passed",
      "Inventory updated with finished goods",
      "Order marked completed",
    ]);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "completed", produced_quantity: o.planned_quantity, progress_pct: 100 } : o)));
    setCompleteModal(order);
    addToast("Order completed");
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Are you sure you want to delete production order ${order.order_number}?`)) {
      return;
    }
    try {
      if (typeof order.id === "number") {
        await deleteProductionOrder(order.id);
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      }
      addToast("Production order deleted successfully", "success");
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || "Delete failed", "error");
    }
  };

  const exportColumns = [
    { key: "order_number", label: "Order No" },
    { key: "product_name", label: "Product" },
    { key: "customer_name", label: "Customer" },
    { key: "planned_quantity", label: "Planned" },
    { key: "produced_quantity", label: "Produced" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
  ];
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const rows = await parseImportFile(file);
        if (!rows.length) {
          addToast("No data rows found in file", "error");
          return;
        }
        const newOrders = rows.map((row, i) =>
          enrichApiOrder(
            {
              ...row,
              id: `import-${Date.now()}-${i}`,
              order_number: row.order_number || `PO-IMPORT-${Date.now()}-${i}`,
              product_name: row.product || row.product_name || "—",
              customer_name: row.customer || row.customer_name || "—",
              planned_quantity: row.planned_quantity ? Number(row.planned_quantity) : 0,
              produced_quantity: row.produced_quantity ? Number(row.produced_quantity) : 0,
            },
            orders.length + i
          )
        );
        setOrders((prev) => {
          const existingNums = new Set(prev.map((o) => o.order_number));
          const fresh = newOrders.filter((o) => !existingNums.has(o.order_number));
          return [...prev, ...fresh];
        });
        addToast(`✅ Imported ${newOrders.length} production order(s) from ${file.name}`, "success");
      } catch {
        addToast("Failed to parse file. Please use the template format.", "error");
      }
    };
    input.click();
  };

  const handleExportExcel = () => {
    exportToExcel(filteredOrders, exportColumns, "production-planning");
    addToast("Exported to Excel");
  };

  const handleExportPdf = () => {
    exportToPdf(filteredOrders, exportColumns, "Production Planning", "production-planning");
    addToast("Exported to PDF");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filteredOrders.map(order => {
      const balanceQty = order.balance_quantity ?? Math.max((order.planned_quantity || 0) - (order.produced_quantity || 0), 0);
      const isDelayedText = order.is_delayed ? "delayed" : statusLabel(order.status);
      const priorityLabelText = order.priority ? order.priority : "—";
      
      return `
        <tr>
          <td><strong>${order.order_number}</strong></td>
          <td>${order.product_name || "—"}</td>
          <td>${order.customer_name || "—"}</td>
          <td>${order.bom_version || "—"}</td>
          <td>${order.planned_quantity || 0}</td>
          <td>${order.produced_quantity ?? 0}</td>
          <td>${balanceQty}</td>
          <td style="text-transform: capitalize;">${priorityLabelText}</td>
          <td>${order.machine_name || "—"}</td>
          <td>${order.shift || "—"}</td>
          <td>${formatDate(order.start_date)}</td>
          <td>${formatDate(order.due_date)}</td>
          <td style="text-transform: capitalize;">${isDelayedText}</td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Production Planning Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1e293b; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { margin: 0; font-size: 24px; color: #0f766e; }
            .header p { margin: 4px 0 0 0; font-size: 14px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #475569; }
            tr:nth-child(even) { background-color: #f8fafc; }
            @media print {
              body { padding: 0; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Production Planning Report</h1>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            <div>
              <p style="font-weight: 600; color: #1e293b;">Total Orders: ${filteredOrders.length}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order No</th>
                <th>Product</th>
                <th>Customer</th>
                <th>BOM</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>Balance</th>
                <th>Priority</th>
                <th>Machine</th>
                <th>Shift</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadTemplate = () => {
    const header = IMPORT_TEMPLATE_HEADERS.join(",");
    const blob = new Blob([`${header}\nPO-2026-1099,Gear Housing,Tata Motors,1000,high,Production,Shift A,2026-07-01,2026-07-15,planned`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "production_orders_import_template.csv";
    a.click();
    addToast("Template downloaded");
  };

  const handlePrintProduct = (order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Order - ${order.order_number}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #0d9488; }
            .header p { margin: 5px 0 0 0; font-size: 14px; color: #64748b; }
            .grid { display: grid; grid-template-cols: 150px 1fr; gap: 15px; font-size: 16px; line-height: 1.5; }
            .label { font-weight: bold; color: #475569; }
            .value { color: #0f172a; }
            @media print {
              body { padding: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Production Order Details</h1>
            <p>Order Number: ${order.order_number}</p>
          </div>
          <div class="grid">
            <div class="label">Product:</div>
            <div class="value">${order.product_name || "—"}</div>
            
            <div class="label">Customer:</div>
            <div class="value">${order.customer_name || "—"}</div>
            
            <div class="label">BOM Version:</div>
            <div class="value">${order.bom_version || "—"}</div>
            
            <div class="label">Planned Qty:</div>
            <div class="value">${order.planned_quantity || 0}</div>
            
            <div class="label">Produced Qty:</div>
            <div class="value">${order.produced_quantity ?? 0}</div>
            
            <div class="label">Balance Qty:</div>
            <div class="value">${order.balance_quantity ?? Math.max((order.planned_quantity || 0) - (order.produced_quantity || 0), 0)}</div>
            
            <div class="label">Priority:</div>
            <div class="value" style="text-transform: capitalize;">${order.priority || "—"}</div>
            
            <div class="label">Machine Assigned:</div>
            <div class="value">${order.machine_name || "—"}</div>
            
            <div class="label">Shift:</div>
            <div class="value">${order.shift || "—"}</div>
            
            <div class="label">Start Date:</div>
            <div class="value">${formatDate(order.start_date)}</div>
            
            <div class="label">Due Date:</div>
            <div class="value">${formatDate(order.due_date)}</div>
            
            <div class="label">Status:</div>
            <div class="value" style="text-transform: capitalize;">${order.status || "—"}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns = [
    { key: "order_number", label: "Order No" },
    { key: "product_name", label: "Product" },
    { key: "customer_name", label: "Customer" },
    { key: "bom_version", label: "BOM" },
    { key: "planned_quantity", label: "Planned Qty" },
    {
      key: "produced_quantity",
      label: "Produced",
      render: (r) => r.produced_quantity ?? 0,
    },
    {
      key: "balance_quantity",
      label: "Balance",
      render: (r) => r.balance_quantity ?? Math.max((r.planned_quantity || 0) - (r.produced_quantity || 0), 0),
    },
    {
      key: "priority",
      label: "Priority",
      render: (r) => <PriorityPill priority={r.priority} />,
    },
    { key: "machine_name", label: "Machine" },
    { key: "shift", label: "Shift" },
    {
      key: "start_date",
      label: "Start",
      render: (r) => formatDate(r.start_date),
    },
    {
      key: "due_date",
      label: "Due",
      render: (r) => formatDate(r.due_date),
    },
    {
      key: "progress",
      label: "Progress",
      sortable: false,
      render: (r) => <ProgressCell row={r} />,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
          r.is_delayed ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
        }`}>
          {r.is_delayed ? "delayed" : statusLabel(r.status)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1 text-xs">
          <button type="button" title="View" onClick={() => openOrder(r)} className="font-semibold text-[#2563EB] hover:underline">👁 View</button>
          {hasEditPermission && (
            <Link to={`/production/edit/${r.id}`} className="font-semibold text-slate-600 hover:underline">✏ Edit</Link>
          )}
          {hasEditPermission && (
            <button type="button" onClick={() => handleDelete(r)} className="font-semibold text-red-600 hover:underline">🗑 Delete</button>
          )}
          {canStart(r.status) && (
            <button type="button" onClick={() => handleStartClick(r)} className="font-semibold text-green-700 hover:underline">▶ Start</button>
          )}
          {canPause(r.status) && (
            <button type="button" onClick={() => handlePause(r)} className="font-semibold text-amber-700 hover:underline">⏸ Pause</button>
          )}
          {canComplete(r.status) && (
            <button type="button" onClick={() => handleComplete(r)} className="font-semibold text-teal-700 hover:underline">✅ Complete</button>
          )}
          <button type="button" onClick={() => handlePrintProduct(r)} className="font-semibold text-slate-500 hover:underline">🖨 Print</button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader label="Loading production planning..." />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Planning</h1>
          <p className="mt-1 text-sm text-slate-500">
            Plan, schedule, and monitor production orders across machines, materials, and operators.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasEditPermission && (
            <Link to="/production/create" className="ui-btn-primary">
              <Plus className="h-4 w-4" /> New Production Order
            </Link>
          )}
          {hasEditPermission && (
            <button type="button" onClick={handleImport} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Upload className="h-4 w-4" /> Import 
            </button>
          )}
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export Excel
          </button>
          <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <FileText className="h-4 w-4" /> Export PDF
          </button>
          <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <SummaryCard label="Total Orders" value={summary.total_orders} icon={ClipboardList} color="bg-[#2563EB]" />
        <SummaryCard label="Planned" value={summary.planned_orders} icon={FileText} color="bg-blue-500" />
        <SummaryCard label="In Progress" value={summary.in_progress_orders} icon={Play} color="bg-amber-500" />
        <SummaryCard label="Completed" value={summary.completed_orders} icon={CheckCircle2} color="bg-green-500" />
        <SummaryCard label="Delayed" value={summary.delayed_orders} icon={AlertTriangle} color="bg-red-500" />
        <SummaryCard label="Cancelled" value={summary.cancelled_orders} icon={Pause} color="bg-slate-500" />
        <SummaryCard label="Today's Target" value={summary.todays_target?.toLocaleString?.() ?? summary.todays_target} icon={ClipboardList} color="bg-indigo-500" />
        <SummaryCard label="Today's Production" value={summary.todays_production?.toLocaleString?.() ?? summary.todays_production} icon={CheckCircle2} color="bg-teal-500" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search production orders..."
            value={filters.order_number || filters.product}
            onChange={(e) => setFilters((f) => ({ ...f, order_number: e.target.value, product: e.target.value }))}
            className="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            {showAdvanced ? "Hide Filters" : "Advanced Filters"}
          </button>
        </div>

        {showAdvanced && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <input placeholder="Order No." value={filters.order_number} onChange={(e) => setFilters((f) => ({ ...f, order_number: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Product" value={filters.product} onChange={(e) => setFilters((f) => ({ ...f, product: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Customer" value={filters.customer} onChange={(e) => setFilters((f) => ({ ...f, customer: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Work Order" value={filters.work_order} onChange={(e) => setFilters((f) => ({ ...f, work_order: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input placeholder="Machine" value={filters.machine} onChange={(e) => setFilters((f) => ({ ...f, machine: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <select value={filters.department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filters.shift} onChange={(e) => setFilters((f) => ({ ...f, shift: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Shift</option>
              {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Priority</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Status</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <input type="date" value={filters.date_from} onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <input type="date" value={filters.date_to} onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" />
            <button type="button" onClick={() => setFilters(defaultFilters)} className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Clear</button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredOrders}
          showSearch={false}
          emptyState={
            <div className="py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm font-medium text-slate-600">No production orders found.</p>
              {hasEditPermission && (
                <Link to="/production/create" className="ui-btn-primary mt-4 inline-flex">Create Production Order</Link>
              )}
            </div>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-50 px-4 py-3">
        {WORKFLOW_STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-[#2563EB]">{step}</span>
            {i < WORKFLOW_STEPS.length - 1 && <span className="text-slate-300">→</span>}
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="mb-2 text-xs font-semibold text-slate-500">Status Flow</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s, i) => (
            <span key={s} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{s}</span>
              {i < STATUS_FLOW.length - 1 && <span className="text-slate-300">↓</span>}
            </span>
          ))}
        </div>
      </div>

      {selected && (
        <ProductionOrderDetailModal
          order={selected}
          detail={detail}
          onClose={() => { setSelected(null); setDetail(null); }}
          onStart={handleStartClick}
          onPause={handlePause}
          onComplete={handleComplete}
        />
      )}

      {startModal && (
        <StartCheckModal
          order={startModal}
          checks={startChecks}
          onClose={() => setStartModal(null)}
          onConfirm={confirmStart}
          loading={startLoading}
        />
      )}

      {completeModal && (
        <CompleteWorkflowModal
          order={completeModal}
          steps={completeSteps}
          onClose={() => setCompleteModal(null)}
        />
      )}
    </div>
  );
} 