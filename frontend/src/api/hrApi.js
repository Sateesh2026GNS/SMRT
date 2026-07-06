import api from "./axiosConfig";

export const getHrDashboard = () => api.get("/hr/dashboard");

export const getEmployees = () => api.get("/hr/employees");

export const createEmployee = (payload) => api.post("/hr/employees", payload);

export const getShifts = () => api.get("/hr/shifts");

export const createShift = (payload) => api.post("/hr/shifts", payload);

export const getAttendance = (_tenantId, params = {}) =>
  api.get("/hr/attendance", { params: { ...params } });

export const createAttendance = (payload) => api.post("/hr/attendance", payload);

export const clockIn = (_tenantId, employeeId, recordDate) =>
  api.post("/hr/attendance/clock-in", null, {
    params: { employee_id: employeeId, record_date: recordDate },
  });

export const clockOut = (_tenantId, employeeId, recordDate) =>
  api.post("/hr/attendance/clock-out", null, {
    params: { employee_id: employeeId, record_date: recordDate },
  });

export const getPayroll = (_tenantId, params = {}) =>
  api.get("/hr/payroll", { params: { ...params } });

export const createPayroll = (payload) => api.post("/hr/payroll", payload);

export const getPerformanceReviews = (_tenantId, employeeId = null) =>
  api.get("/hr/performance", {
    params: { employee_id: employeeId },
  });

export const createPerformanceReview = (payload) =>
  api.post("/hr/performance", payload);

export const getLeaveRequests = (params = {}) =>
  api.get("/hr/leave", { params });

export const createLeaveRequest = (payload) => api.post("/hr/leave", payload);

export const updateLeaveRequest = (leaveId, payload) =>
  api.patch(`/hr/leave/${leaveId}`, payload);
