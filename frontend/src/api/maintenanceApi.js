import api from "./axiosConfig";

export const getRecords = () => api.get("/maintenance/records");
export const createRecord = (payload) => api.post("/maintenance/records", payload);

export const getMaintenanceHub = () => api.get("/maintenance/hub");

export const getPreventiveSummary = () => api.get("/maintenance/preventive/summary");
export const getPreventiveEnriched = () => api.get("/maintenance/preventive/enriched");
export const getPreventive = () => api.get("/maintenance/preventive");
export const createPreventive = (payload) => api.post("/maintenance/preventive", payload);

export const getBreakdownSummary = () => api.get("/maintenance/breakdowns/summary");
export const getBreakdownsEnriched = () => api.get("/maintenance/breakdowns/enriched");
export const getBreakdowns = () => api.get("/maintenance/breakdowns");
export const createBreakdown = (payload) => api.post("/maintenance/breakdowns", payload);
export const updateBreakdownStatus = (breakdownId, status) =>
  api.patch(`/maintenance/breakdowns/${breakdownId}/status`, null, { params: { status } });

export const getMachineHistory = () => api.get("/maintenance/history");

export const getSchedule = () => api.get("/maintenance/schedule");
export const createSchedule = (payload) => api.post("/maintenance/schedule", payload);
