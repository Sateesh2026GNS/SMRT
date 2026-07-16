/** Department master demo data and helpers. */

export const DEPARTMENT_STATUSES = ["active", "inactive"];
export const DEPARTMENT_TYPES = [
  { value: "production", label: "Production" },
  { value: "support", label: "Support" },
  { value: "admin", label: "Administration" },
];
export const PLANTS = ["Plant 1", "Plant 2", "Head Office"];
export const BRANCHES = ["Hyderabad", "Bengaluru", "Mumbai", "Chennai"];

export const RECOMMENDED_DEPARTMENTS = [
  "Production",
  "Quality Control",
  "Stores",
  "Purchase",
  "Sales",
  "Maintenance",
  "Engineering",
  "Packing",
  "Dispatch",
  "Accounts",
  "HR",
  "Administration",
  "IT",
];

export const WORKFLOW_STEPS = [
  "Company",
  "Department",
  "Work Center",
  "Machine",
  "Employee",
  "Production",
  "Quality",
  "Finished Goods",
];

export const REPORT_TYPES = [
  "Department Performance",
  "Employee Report",
  "Machine Utilization",
  "Production Report",
  "Attendance Report",
];

export const IMPORT_TEMPLATE_HEADERS = [
  "code", "name", "department_type", "plant", "branch", "manager_name",
  "manager_mobile", "manager_email", "status",
];

const MANAGERS = [
  { name: "Ramesh Gupta", mobile: "+91 98765 10001", email: "ramesh@smrt.local", designation: "HOD" },
  { name: "Priya Sharma", mobile: "+91 91234 10002", email: "priya@smrt.local", designation: "Manager" },
  { name: "Suresh Reddy", mobile: "+91 99887 10003", email: "suresh@smrt.local", designation: "Supervisor" },
  { name: "Anita Desai", mobile: "+91 97654 10004", email: "anita@smrt.local", designation: "HOD" },
  { name: "Vikram Singh", mobile: "+91 96543 10005", email: "vikram@smrt.local", designation: "Manager" },
  { name: "Kiran Patel", mobile: "+91 95432 10006", email: "kiran@smrt.local", designation: "HOD" },
  { name: "Meena Rao", mobile: "+91 94321 10007", email: "meena@smrt.local", designation: "Manager" },
  { name: "Arjun Nair", mobile: "+91 93210 10008", email: "arjun@smrt.local", designation: "Supervisor" },
  { name: "Deepak Joshi", mobile: "+91 92109 10009", email: "deepak@smrt.local", designation: "HOD" },
  { name: "Lakshmi Iyer", mobile: "+91 91098 10010", email: "lakshmi@smrt.local", designation: "Manager" },
  { name: "Rajesh Kumar", mobile: "+91 90987 10011", email: "rajesh@smrt.local", designation: "HOD" },
  { name: "Sunita Verma", mobile: "+91 89876 10012", email: "sunita@smrt.local", designation: "Manager" },
];

function buildDept(i, name, type, employees, machines, workCenters, status = "active") {
  const n = i + 1;
  const mgr = MANAGERS[i % MANAGERS.length];
  const running = Math.round(machines * 0.72);
  const idle = Math.max(machines - running - 1, 0);
  const breakdown = machines > 0 ? 1 : 0;
  const maintenance = machines > 5 ? 1 : 0;
  const present = Math.round(employees * 0.88);
  return {
    id: `demo-${n}`,
    code: `DEP${String(n).padStart(3, "0")}`,
    name,
    department_type: type,
    plant: PLANTS[i % 2],
    branch: BRANCHES[i % BRANCHES.length],
    description: `${name} department — operations, staffing, and resource management.`,
    status,
    is_active: status === "active",
    manager_name: mgr.name,
    manager_mobile: mgr.mobile,
    manager_email: mgr.email,
    manager_designation: mgr.designation,
    employee_count: employees,
    machine_count: machines,
    work_center_count: workCenters,
    present_today: present,
    absent_today: employees - present,
    shift_a_count: Math.round(employees / 3),
    shift_b_count: Math.round(employees / 3),
    shift_c_count: employees - Math.round(employees / 3) * 2,
    machines_running: running,
    machines_idle: idle,
    machines_breakdown: breakdown,
    machines_maintenance: maintenance,
    todays_target: machines > 0 ? machines * 180 : 0,
    todays_production: machines > 0 ? Math.round(machines * 180 * 0.82) : 0,
    pending_work_orders: machines > 0 ? Math.round(machines * 0.4) : 0,
    completed_work_orders: machines > 0 ? Math.round(machines * 2.5) : 0,
    work_centers: Array.from({ length: workCenters }, (_, j) => ({
      name: `WC-${String(n).padStart(2, "0")}-${j + 1}`,
      capacity: "8 hrs/shift",
      shift: ["Shift A", "Shift B", "Shift C"][j % 3],
      supervisor: mgr.name,
    })),
    documents: [
      { name: "Department SOP", type: "PDF" },
      { name: "Organization Chart", type: "PDF" },
    ],
    audit_logs: [
      { action: "Department Updated", user: "Admin", timestamp: "2026-07-08 10:30" },
    ],
  };
}

export const DEMO_DEPARTMENTS = [
  buildDept(0, "Production", "production", 85, 25, 5),
  buildDept(1, "Quality Control", "production", 20, 5, 2),
  buildDept(2, "Stores", "support", 16, 0, 0),
  buildDept(3, "Purchase", "support", 10, 0, 0),
  buildDept(4, "Sales", "support", 14, 0, 0),
  buildDept(5, "Maintenance", "production", 12, 8, 2),
  buildDept(6, "Engineering", "production", 16, 5, 2),
  buildDept(7, "Packing", "production", 28, 12, 3),
  buildDept(8, "Dispatch", "production", 12, 4, 1),
  buildDept(9, "Accounts", "support", 9, 0, 0),
  buildDept(10, "HR", "support", 7, 0, 0),
  buildDept(11, "Administration", "admin", 5, 0, 0, "inactive"),
];

export function enrichApiDepartment(row, index = 0) {
  const code = row.code || `DEP${String(row.id || index + 1).padStart(3, "0")}`;
  return {
    ...row,
    code,
    name: row.name || "Unnamed Department",
    department_type: row.department_type || "production",
    plant: row.plant || "Plant 1",
    branch: row.branch || "Hyderabad",
    status: row.status || "active",
    manager_name: row.manager_name || "—",
    manager_mobile: row.manager_mobile || "—",
    manager_email: row.manager_email || "—",
    manager_designation: row.manager_designation || "Manager",
    employee_count: row.employee_count ?? 0,
    machine_count: row.machine_count ?? 0,
    work_center_count: row.work_center_count ?? 0,
    present_today: row.present_today ?? 0,
    absent_today: row.absent_today ?? 0,
    todays_target: row.todays_target ?? 0,
    todays_production: row.todays_production ?? 0,
    pending_work_orders: row.pending_work_orders ?? 0,
    completed_work_orders: row.completed_work_orders ?? 0,
    work_centers: row.work_centers || [],
    documents: row.documents || [],
    audit_logs: row.audit_logs || [],
  };
}

export function computeDepartmentSummary(departments) {
  const active = departments.filter((d) => d.status === "active").length;
  const production = departments.filter(
    (d) => d.department_type === "production" && d.status === "active"
  ).length;
  const support = departments.filter(
    (d) => d.department_type === "support" && d.status === "active"
  ).length;
  const totalEmployees = departments.reduce((s, d) => s + (d.employee_count || 0), 0);
  const totalMachines = departments.reduce((s, d) => s + (d.machine_count || 0), 0);
  return {
    total_departments: departments.length,
    active_departments: active,
    production_departments: production,
    support_departments: support,
    total_employees: totalEmployees,
    total_machines: totalMachines,
  };
}

export function departmentTypeLabel(type) {
  const match = DEPARTMENT_TYPES.find((t) => t.value === type);
  return match?.label || type;
}
