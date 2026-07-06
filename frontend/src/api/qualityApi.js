import api from "./axiosConfig";

// Inspections
export const getInspections = () => api.get("/quality/inspection");
export const createInspection = (payload) =>
  api.post("/quality/inspection", payload);

// Defects
export const getDefects = () => api.get("/quality/defects");
export const createDefect = (payload) => api.post("/quality/defects", payload);
export const updateDefectStatus = (defectId, status) =>
  api.patch(`/quality/defects/${defectId}/status`, null, { params: { status } });

// Batch quality reports
export const getBatchReports = () => api.get("/quality/batch-reports");
export const createBatchReport = (payload) =>
  api.post("/quality/batch-reports", payload);

// Compliance logs
export const getComplianceLogs = () => api.get("/quality/compliance");
export const createComplianceLog = (payload) =>
  api.post("/quality/compliance", payload);
