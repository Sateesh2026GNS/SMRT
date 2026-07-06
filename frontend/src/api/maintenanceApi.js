import api from "./axiosConfig";

// Maintenance records
export const getRecords = () => api.get("/maintenance/records");
export const createRecord = (payload) => api.post("/maintenance/records", payload);

// Preventive maintenance
export const getPreventive = () => api.get("/maintenance/preventive");
export const createPreventive = (payload) =>
  api.post("/maintenance/preventive", payload);

// Breakdown reports
export const getBreakdowns = () => api.get("/maintenance/breakdowns");
export const createBreakdown = (payload) =>
  api.post("/maintenance/breakdowns", payload);
export const updateBreakdownStatus = (breakdownId, status) =>
  api.patch(`/maintenance/breakdowns/${breakdownId}/status`, null, {
    params: { status },
  });

// Maintenance schedule
export const getSchedule = () => api.get("/maintenance/schedule");
export const createSchedule = (payload) =>
  api.post("/maintenance/schedule", payload);
