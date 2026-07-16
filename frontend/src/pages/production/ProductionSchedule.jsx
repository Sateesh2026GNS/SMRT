import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  Factory,
  GanttChart,
  LayoutGrid,
  Plus,
  RefreshCw,
  Table2,
  Users,
  Zap,
} from "lucide-react";

import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getWorkOrders } from "../../api/productionApi";
import {
  getScheduleBottomKpis,
  getScheduleCalendar,
  getScheduleConflicts,
  getScheduleDashboard,
  getScheduleLiveMachines,
  getScheduleMaterials,
  getScheduleQueue,
  getScheduleShifts,
  getScheduleTimeline,
  rescheduleWorkOrder,
} from "../../api/schedulingApi";
import {
  CONFLICT_LABELS,
  DEMO_BOTTOM_KPIS,
  DEMO_CALENDAR_EVENTS,
  DEMO_CONFLICTS,
  DEMO_DASHBOARD,
  DEMO_KANBAN,
  DEMO_LIVE_MACHINES,
  DEMO_MATERIALS,
  DEMO_QUEUE,
  DEMO_RESOURCE,
  DEMO_SHIFTS,
  DEMO_TABLE_ROWS,
  DEMO_TIMELINE,
  KANBAN_COLUMNS,
  SCHEDULE_FLOW_STEPS,
  TIMELINE_SLOTS,
  buildTableFromTimeline,
  formatScheduleDate,
  machineStatusColor,
  machineStatusDot,
  priorityBadge,
} from "../../data/productionScheduleMasterData";
import { exportToExcel } from "../../utils/exportUtils";

const VIEWS = [
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "timeline", label: "Timeline", icon: GanttChart },
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
  { id: "table", label: "Table", icon: Table2 },
];

function SummaryCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{value}</p>
          {sub && <p className="mt-0.5 text-[10px] text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ pct }) {
  const filled = Math.min(Math.max(pct, 0), 100);
  const blocks = 10;
  const active = Math.round(filled / 10);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: blocks }).map((_, i) => (
          <span
            key={i}
            className={`inline-block h-3 w-3 rounded-sm ${i < active ? "bg-[#2563EB]" : "bg-slate-200"}`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-slate-700">{filled}%</span>
    </div>
  );
}

function TimelineView({ rows, onDrop }) {
  const [dragWo, setDragWo] = useState(null);

  const handleDragStart = (row) => {
    if (!row.work_order_id) return;
    setDragWo(row);
  };

  const handleDrop = (targetMachineId) => {
    if (!dragWo || dragWo.machine_id === targetMachineId) return;
    onDrop(dragWo, targetMachineId);
    setDragWo(null);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 grid min-w-[640px] grid-cols-[140px_repeat(6,1fr)] gap-1 text-center text-xs font-semibold text-slate-500">
        <div />
        {TIMELINE_SLOTS.map((s) => (
          <div key={s}>{s}</div>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.machine_id}
            className="grid min-w-[640px] grid-cols-[140px_repeat(6,1fr)] items-center gap-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(row.machine_id)}
          >
            <div className="pr-2 text-sm font-semibold text-slate-800">{row.machine_name}</div>
            <div className="col-span-6 relative h-10 rounded-lg bg-slate-50">
              {row.span_slots > 0 && (
                <div
                  draggable={!!row.work_order_id}
                  onDragStart={() => handleDragStart(row)}
                  className={`absolute inset-y-1 flex items-center rounded-md px-2 text-xs font-semibold text-white shadow-sm ${
                    row.status === "maintenance"
                      ? "bg-slate-500 cursor-default"
                      : row.status === "running"
                        ? "bg-[#2563EB] cursor-grab active:cursor-grabbing"
                        : "bg-amber-500 cursor-grab active:cursor-grabbing"
                  }`}
                  style={{
                    left: `${(row.start_slot / 6) * 100}%`,
                    width: `${(row.span_slots / 6) * 100}%`,
                  }}
                  title={row.work_order_id ? "Drag to reschedule on another machine" : undefined}
                >
                  {row.job_label}
                </div>
              )}
              {row.span_slots === 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  {row.job_label}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Drag a job block onto another machine row to reschedule. Conflicts are checked automatically.
      </p>
    </div>
  );
}

function CalendarView({ events }) {
  const days = ["Mon 7", "Tue 8", "Wed 9", "Thu 10", "Fri 11", "Sat 12", "Sun 13"];
  const statusColor = {
    running: "bg-green-100 border-green-400 text-green-800",
    planned: "bg-blue-100 border-blue-400 text-blue-800",
    completed: "bg-slate-100 border-slate-400 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Weekly Production Calendar</h3>
        <div className="flex gap-2 text-xs">
          <button type="button" className="rounded-lg border px-2 py-1 text-slate-600">Daily</button>
          <button type="button" className="rounded-lg bg-[#2563EB] px-2 py-1 text-white">Weekly</button>
          <button type="button" className="rounded-lg border px-2 py-1 text-slate-600">Monthly</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div key={d} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center text-xs font-semibold text-slate-600">
            {d}
          </div>
        ))}
        {days.map((d, di) => (
          <div key={`cell-${d}`} className="min-h-[100px] rounded-lg border border-slate-100 p-2">
            {events
              .filter((e) => {
                const day = 7 + di;
                const start = e.start ? new Date(e.start).getDate() : 0;
                const end = e.end ? new Date(e.end).getDate() : start;
                return day >= start && day <= end;
              })
              .map((e) => (
                <div
                  key={e.id}
                  className={`mb-1 rounded border px-1.5 py-1 text-[10px] font-medium ${statusColor[e.status] || statusColor.planned}`}
                >
                  {e.product}
                  <span className="block text-[9px] opacity-70">{e.planned_quantity} units</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanView({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {KANBAN_COLUMNS.map((col) => (
        <div key={col.id} className={`rounded-2xl border-2 p-3 ${col.color}`}>
          <h4 className="mb-3 text-sm font-bold text-slate-800">{col.label}</h4>
          <div className="space-y-2">
            {(items[col.id] || []).map((card) => (
              <div key={card.id} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                <p className="text-xs font-bold text-slate-800">{card.work_order_number}</p>
                <p className="text-sm text-slate-700">{card.product_name}</p>
                <p className="text-xs text-slate-500">{card.quantity} Qty · {card.machine_name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityBadge(card.priority).bg} ${priorityBadge(card.priority).text}`}>
                  {priorityBadge(card.priority).label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductionSchedule() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("timeline");
  const [dashboard, setDashboard] = useState(DEMO_DASHBOARD);
  const [timeline, setTimeline] = useState(DEMO_TIMELINE);
  const [shifts, setShifts] = useState(DEMO_SHIFTS);
  const [liveMachines, setLiveMachines] = useState(DEMO_LIVE_MACHINES);
  const [queue, setQueue] = useState(DEMO_QUEUE);
  const [materials, setMaterials] = useState(DEMO_MATERIALS);
  const [conflicts, setConflicts] = useState(DEMO_CONFLICTS);
  const [bottomKpis, setBottomKpis] = useState(DEMO_BOTTOM_KPIS);
  const [calendarEvents, setCalendarEvents] = useState(DEMO_CALENDAR_EVENTS);
  const [kanban, setKanban] = useState(DEMO_KANBAN);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [tableSearch, setTableSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        dashRes, timelineRes, shiftRes, liveRes, queueRes,
        matRes, conflictRes, bottomRes, calRes, woRes,
      ] = await Promise.allSettled([
        getScheduleDashboard(),
        getScheduleTimeline(),
        getScheduleShifts(),
        getScheduleLiveMachines(),
        getScheduleQueue(),
        getScheduleMaterials(),
        getScheduleConflicts(),
        getScheduleBottomKpis(),
        getScheduleCalendar(),
        getWorkOrders(),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.data) {
        setDashboard({ ...DEMO_DASHBOARD, ...dashRes.value.data });
      }
      if (timelineRes.status === "fulfilled" && timelineRes.value?.data?.length) {
        setTimeline(timelineRes.value.data);
      } else {
        setTimeline(DEMO_TIMELINE);
      }
      if (shiftRes.status === "fulfilled" && shiftRes.value?.data?.length) {
        setShifts(shiftRes.value.data);
      }
      if (liveRes.status === "fulfilled" && liveRes.value?.data?.length) {
        setLiveMachines(liveRes.value.data);
      }
      if (queueRes.status === "fulfilled" && queueRes.value?.data?.length) {
        setQueue(queueRes.value.data);
      }
      if (matRes.status === "fulfilled" && matRes.value?.data?.length) {
        setMaterials(matRes.value.data);
      }
      if (conflictRes.status === "fulfilled") {
        setConflicts(conflictRes.value?.data?.length ? conflictRes.value.data : DEMO_CONFLICTS);
      }
      if (bottomRes.status === "fulfilled" && bottomRes.value?.data) {
        setBottomKpis({ ...DEMO_BOTTOM_KPIS, ...bottomRes.value.data });
      }
      if (calRes.status === "fulfilled" && calRes.value?.data?.length) {
        setCalendarEvents(calRes.value.data);
      }
      if (woRes.status === "fulfilled" && woRes.value?.data) {
        const list = woRes.value.data;
        setWorkOrders(list);
        
        // Group for Kanban
        const grouped = { planned: [], ready: [], running: [], quality: [], completed: [] };
        list.forEach((wo) => {
          const status = (wo.status || "planned").toLowerCase();
          const colId = KANBAN_COLUMNS.some(c => c.id === status) ? status : "planned";
          grouped[colId].push({
            id: wo.id,
            work_order_number: wo.work_order_number,
            product_name: wo.product_name || "—",
            quantity: wo.planned_quantity,
            machine_name: wo.machine_name || "Unassigned",
            priority: wo.priority || "medium",
          });
        });
        setKanban(grouped);
      }
    } catch {
      addToast("Using demo schedule data", "info");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (workOrders.length && !selectedWorkOrder) {
      setSelectedWorkOrder(workOrders[0]);
    }
  }, [workOrders, selectedWorkOrder]);

  const tableRows = useMemo(
    () => buildTableFromTimeline(timeline, shifts),
    [timeline, shifts]
  );

  const filteredTable = useMemo(() => {
    if (!tableSearch.trim()) return tableRows;
    const q = tableSearch.toLowerCase();
    return tableRows.filter((r) =>
      [r.work_order_number, r.product_name, r.machine_name, r.operator_name, r.status]
        .some((v) => v && String(v).toLowerCase().includes(q))
    );
  }, [tableRows, tableSearch]);

  const handleReschedule = async (sourceRow, targetMachineId) => {
    const target = timeline.find((r) => r.machine_id === targetMachineId);
    if (!target || target.status === "maintenance") {
      addToast("Cannot schedule on maintenance machine", "error");
      return;
    }
    const numericWo = typeof sourceRow.work_order_id === "number";
    const numericMachine = typeof targetMachineId === "number";
    if (numericWo && numericMachine) {
      try {
        const res = await rescheduleWorkOrder({
          work_order_id: sourceRow.work_order_id,
          machine_id: targetMachineId,
          start_slot: 0,
        });
        if (res.data?.success) {
          addToast(res.data.message, "success");
          load();
          return;
        }
        addToast(res.data?.message || "Reschedule blocked", "error");
        return;
      } catch {
        addToast("Reschedule failed — updating locally", "warning");
      }
    }
    setTimeline((prev) =>
      prev.map((r) => {
        if (r.machine_id === sourceRow.machine_id) {
          return { ...r, job_label: "Idle", work_order_id: null, work_order_number: null, span_slots: 0, status: "idle" };
        }
        if (r.machine_id === targetMachineId) {
          return {
            ...r,
            job_label: sourceRow.job_label,
            work_order_id: sourceRow.work_order_id,
            work_order_number: sourceRow.work_order_number,
            span_slots: sourceRow.span_slots || 3,
            start_slot: 0,
            status: "planned",
          };
        }
        return r;
      })
    );
    addToast(`Moved ${sourceRow.job_label} to ${target?.machine_name}`, "success");
  };

  const tableColumns = [
    { key: "schedule_id", label: "Schedule ID" },
    { key: "work_order_number", label: "Work Order" },
    { key: "product_name", label: "Product" },
    { key: "machine_name", label: "Machine" },
    { key: "operator_name", label: "Operator" },
    { key: "shift", label: "Shift" },
    { key: "start", label: "Start" },
    { key: "end", label: "End" },
    { key: "quantity", label: "Qty" },
    {
      key: "priority",
      label: "Priority",
      render: (row) => {
        const p = priorityBadge(row.priority);
        return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.bg} ${p.text}`}>{p.label}</span>;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${machineStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    exportToExcel(filteredTable, tableColumns.filter((c) => !c.render), "production-schedule");
    addToast("Schedule exported", "success");
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Schedule</h1>
          <p className="mt-1 text-sm text-slate-500">
            Calendar, Gantt timeline, Kanban, and machine-wise scheduling control center.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/production/work-orders/create-quick" className="ui-btn-primary">
            <Plus className="h-4 w-4" /> New Schedule
          </Link>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export
          </button>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
        <span className="font-semibold">Today:</span> {formatScheduleDate(dashboard.today)}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <SummaryCard label="Production Target" value={dashboard.production_target?.toLocaleString()} icon={Factory} color="bg-[#2563EB]" />
        <SummaryCard label="Completed" value={dashboard.completed?.toLocaleString()} icon={CheckCircle2} color="bg-green-500" />
        <SummaryCard label="Pending" value={dashboard.pending?.toLocaleString()} icon={ClipboardList} color="bg-amber-500" />
        <SummaryCard label="Overall Progress" value={<ProgressBar pct={dashboard.overall_progress_pct} />} color="bg-indigo-500" />
        <SummaryCard label="Machine Utilization" value={`${dashboard.machine_utilization_pct}%`} icon={Zap} color="bg-teal-500" />
        <SummaryCard label="Operators Present" value={dashboard.operators_present} icon={Users} color="bg-blue-500" />
        <SummaryCard label="Delayed Orders" value={dashboard.delayed_orders} icon={AlertTriangle} color="bg-red-500" />
        <SummaryCard label="Material Shortage" value={dashboard.material_shortage} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const active = view === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" /> {v.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          {view === "timeline" && <TimelineView rows={timeline} onDrop={handleReschedule} />}
          {view === "calendar" && <CalendarView events={calendarEvents} />}
          {view === "kanban" && <KanbanView items={kanban} />}
          {view === "table" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <input
                type="search"
                placeholder="Search schedules..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <DataTable
                columns={tableColumns}
                data={filteredTable}
                searchKeys={["work_order_number", "product_name", "machine_name"]}
                showSearch={false}
              />
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Shift Schedule</h3>
            <div className="space-y-3">
              {shifts.map((s, i) => (
                <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                  <p className="font-bold text-slate-800">{s.shift_name}</p>
                  <p className="text-slate-600">{s.machine_name} · {s.operator_name}</p>
                  <p className="text-slate-700">{s.product_name} — {s.quantity} Qty</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 font-semibold capitalize ${machineStatusColor(s.status)}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Live Machine Status</h3>
            <div className="space-y-2">
              {liveMachines.filter((m) => m.status === "running").length > 0 ? (
                liveMachines
                  .filter((m) => m.status === "running")
                  .map((m) => (
                    <div key={m.machine_id} className="rounded-lg border border-slate-100 p-3">
                      <p className="text-sm font-bold text-slate-800">
                        {machineStatusDot(m.status)} {m.machine_name}
                      </p>
                      <p className="text-xs capitalize text-slate-600">{m.status}</p>
                      {m.job && <p className="text-xs text-slate-500">Job {m.job}</p>}
                      {m.progress_pct > 0 && (
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full bg-green-500" style={{ width: `${m.progress_pct}%` }} />
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-500">No machines currently running</p>
              )}
            </div>
          </section>


          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Production Queue</h3>
            <ol className="space-y-2">
              {queue.map((q) => (
                <li key={q.position} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2 text-xs">
                  <span className="font-bold text-[#2563EB]">{q.position}.</span>
                  <div>
                    <p className="font-semibold text-slate-800">{q.product_name}</p>
                    <p className="text-slate-600">{q.quantity} Qty</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityBadge(q.priority).bg} ${priorityBadge(q.priority).text}`}>
                      Priority {priorityBadge(q.priority).label}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Material Availability</h3>
            <ul className="space-y-2 text-sm">
              {materials.map((m) => (
                <li key={m.product_name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="font-medium text-slate-800">{m.product_name}</span>
                  <span className={m.available ? "text-green-600" : "text-amber-600"}>
                    {m.available ? "✔ Available" : "⚠ Shortage"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Resource Allocation</h3>
            <dl className="space-y-1 text-xs text-slate-700">
              <div className="flex justify-between"><dt className="text-slate-500">Machine</dt><dd className="font-semibold">{selectedWorkOrder?.machine_name || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Operator</dt><dd className="font-semibold">{selectedWorkOrder?.operator_name || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shift</dt><dd className="font-semibold">{selectedWorkOrder?.shift || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Supervisor</dt><dd className="font-semibold">{selectedWorkOrder?.supervisor || "—"}</dd></div>
            </dl>
            {workOrders.length > 1 && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Select Work Order:</label>
                <select
                  value={selectedWorkOrder?.id || ""}
                  onChange={(e) => {
                    const found = workOrders.find(w => w.id === Number(e.target.value));
                    if (found) setSelectedWorkOrder(found);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {workOrders.map(w => (
                    <option key={w.id} value={w.id}>{w.work_order_number} ({w.product_name})</option>
                  ))}
                </select>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-amber-900">Schedule Conflicts</h3>
            <ul className="space-y-2 text-xs">
              {conflicts.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-900">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{CONFLICT_LABELS[c.conflict_type] || c.conflict_type}</p>
                    <p className="text-amber-800">{c.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <SummaryCard label="Today's Production" value={bottomKpis.todays_production?.toLocaleString()} />
        <SummaryCard label="Pending Orders" value={bottomKpis.pending_orders?.toLocaleString()} />
        <SummaryCard label="Machine Efficiency" value={`${bottomKpis.machine_efficiency_pct}%`} />
        <SummaryCard label="Shift Efficiency" value={`${bottomKpis.shift_efficiency_pct}%`} />
        <SummaryCard label="Downtime" value={`${bottomKpis.downtime_minutes} min`} />
        <SummaryCard label="Power Consumption" value={`${bottomKpis.power_kwh} kWh`} />
        <SummaryCard label="OEE" value={`${bottomKpis.oee_pct}%`} />
        <SummaryCard label="Quality Rate" value={`${bottomKpis.quality_rate_pct}%`} />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-50 px-4 py-3">
        {SCHEDULE_FLOW_STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-[#2563EB]">{step}</span>
            {i < SCHEDULE_FLOW_STEPS.length - 1 && <span className="text-slate-300">↓</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
