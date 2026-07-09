/** HR demo data and helpers. */

export const HR_FLOW = [
  "Employee Joining", "Department Allocation", "Shift Assignment", "Attendance",
  "Production Allocation", "Performance", "Leave", "Payroll", "Exit Process",
];

export const LEAVE_TYPES = ["casual", "sick", "earned", "comp_off", "maternity", "paternity", "lop"];
export const SHIFTS = ["Morning", "General", "Evening", "Night", "Rotational"];
export const EMPLOYMENT_TYPES = ["permanent", "contract", "temporary", "intern"];
export const DEPARTMENT_COLORS = {
  Production: "bg-blue-100 text-blue-800",
  Quality: "bg-purple-100 text-purple-800",
  Maintenance: "bg-orange-100 text-orange-800",
  Stores: "bg-teal-100 text-teal-800",
  HR: "bg-pink-100 text-pink-800",
  Finance: "bg-indigo-100 text-indigo-800",
};

export const DEMO_EMP_SUMMARY = {
  total_employees: 248, present_today: 198, absent: 32, on_leave: 18,
  overtime: 42.5, departments: 12, contract_employees: 45, new_joiners: 8,
};

export const DEMO_EMP_LIST = [
  { id: "e1", employee_id: "EMP-00248", full_name: "Ravi Kumar", department: "Production", designation: "Machine Operator", shift: "Morning", reporting_manager: "Suresh Reddy", employment_type: "permanent", status: "active", phone: "+91 98765 43210", email: "ravi@smrt.com", joining_date: "2024-03-15", salary: 28000, initials: "RK" },
  { id: "e2", employee_id: "EMP-00247", full_name: "Priya Sharma", department: "Quality", designation: "QC Inspector", shift: "General", reporting_manager: "Mahesh Patel", employment_type: "permanent", status: "active", phone: "+91 91234 56789", email: "priya@smrt.com", joining_date: "2023-08-01", salary: 32000, initials: "PS" },
  { id: "e3", employee_id: "EMP-00246", full_name: "Mahesh Patel", department: "Maintenance", designation: "Technician", shift: "Evening", reporting_manager: "Anita Desai", employment_type: "contract", status: "active", phone: "+91 99887 76655", email: "mahesh@smrt.com", joining_date: "2025-06-20", salary: 24000, initials: "MP" },
  { id: "e4", employee_id: "EMP-00245", full_name: "Anita Desai", department: "HR", designation: "HR Manager", shift: "General", reporting_manager: "CEO", employment_type: "permanent", status: "active", phone: "+91 97654 32109", email: "anita@smrt.com", joining_date: "2022-01-10", salary: 55000, initials: "AD" },
];

export const DEMO_ATT_SUMMARY = { present: 198, absent: 32, late: 12, half_day: 6, overtime: 42.5, night_shift: 28, total_working_hours: 1584 };
export const DEMO_ATT_LIST = [
  { id: "a1", employee_name: "Ravi Kumar", shift: "Morning", check_in: "06:02", check_out: "14:05", break_minutes: 30, working_hours: 7.5, overtime: 0.5, status: "present", source: "biometric", record_date: "2026-07-09" },
  { id: "a2", employee_name: "Priya Sharma", shift: "General", check_in: "09:18", check_out: "18:00", break_minutes: 45, working_hours: 8, overtime: 0, status: "late", source: "rfid", record_date: "2026-07-09" },
  { id: "a3", employee_name: "Mahesh Patel", shift: "Evening", check_in: "14:00", check_out: "22:30", break_minutes: 30, working_hours: 8, overtime: 0.5, status: "present", source: "gps", record_date: "2026-07-09" },
];

export const DEMO_LEAVE_SUMMARY = { pending_leave: 14, approved: 86, rejected: 8, available_leave: 12, sick_leave: 8, casual_leave: 6, earned_leave: 15 };
export const DEMO_LEAVE_LIST = [
  { id: "l1", employee_name: "Ravi Kumar", leave_type: "casual", start_date: "2026-07-12", end_date: "2026-07-13", days: 2, reason: "Family function", status: "pending" },
  { id: "l2", employee_name: "Priya Sharma", leave_type: "sick", start_date: "2026-07-08", end_date: "2026-07-09", days: 2, reason: "Medical", status: "approved" },
  { id: "l3", employee_name: "Mahesh Patel", leave_type: "earned", start_date: "2026-07-20", end_date: "2026-07-25", days: 6, reason: "Vacation", status: "pending" },
];

export const DEMO_PAY_SUMMARY = { monthly_payroll: 4_250_000, pending_salary: 320_000, processed_salary: 3_930_000, overtime_cost: 185_000, pf: 510_000, esi: 31_875, professional_tax: 2500 };
export const DEMO_PAY_LIST = [
  { id: "p1", employee_name: "Ravi Kumar", basic: 22000, allowance: 4000, overtime: 2000, bonus: 0, pf: 2640, esi: 165, tax: 0, net_salary: 25195, status: "processed", period_start: "2026-07-01", period_end: "2026-07-31" },
  { id: "p2", employee_name: "Priya Sharma", basic: 26000, allowance: 5000, overtime: 0, bonus: 1000, pf: 3120, esi: 195, tax: 500, net_salary: 28185, status: "processed", period_start: "2026-07-01", period_end: "2026-07-31" },
  { id: "p3", employee_name: "Mahesh Patel", basic: 18000, allowance: 4000, overtime: 1500, bonus: 0, pf: 2160, esi: 135, tax: 0, net_salary: 21205, status: "draft", period_start: "2026-07-01", period_end: "2026-07-31" },
];

export const DEMO_HR_HUB = {
  total_employees: 248, present_today: 198, pending_leave: 14, monthly_payroll: 4_250_000,
  overtime_hours: 42.5, new_joiners: 8, attrition_rate: 2.4,
  department_strength: [{ name: "Production", count: 85 }, { name: "Quality", count: 32 }, { name: "Maintenance", count: 28 }, { name: "Stores", count: 22 }],
  shift_utilization: [{ name: "Morning", utilization: 92 }, { name: "General", utilization: 88 }, { name: "Evening", utilization: 78 }, { name: "Night", utilization: 65 }],
  alerts: [
    { type: "certification", message: "3 operators — Machine Safety certification expiring" },
    { type: "leave", message: "14 leave requests pending HR approval" },
    { type: "payroll", message: "July payroll — ₹3.2L pending processing" },
    { type: "attendance", message: "12 employees late today" },
  ],
};

export function formatInr(v) {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)} Cr`;
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)} L`;
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

export function statusColor(s) {
  const m = {
    active: "bg-green-100 text-green-800", inactive: "bg-slate-200 text-slate-700",
    present: "bg-green-100 text-green-800", absent: "bg-red-100 text-red-800",
    late: "bg-amber-100 text-amber-800", half_day: "bg-orange-100 text-orange-800",
    pending: "bg-amber-100 text-amber-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800",
    draft: "bg-slate-100 text-slate-700", processed: "bg-green-100 text-green-800", paid: "bg-green-100 text-green-800",
  };
  return m[s] || "bg-slate-100 text-slate-700";
}

export function deptColor(dept) {
  return DEPARTMENT_COLORS[dept] || "bg-slate-100 text-slate-700";
}

export function sourceLabel(s) {
  const m = { biometric: "Biometric", rfid: "RFID", gps: "GPS", qr: "QR", face: "Face Recognition", manual: "Manual" };
  return m[s] || s || "—";
}
