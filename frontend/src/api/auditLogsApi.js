import api from "./axiosConfig";

export const getAuditLogs = (params = {}) =>
  api.get("/api/audit-logs", { params });

export const getMyAuditLogs = (params = {}) =>
  api.get("/api/audit-logs/me", { params });

export const getCompanyAuditLogs = (params = {}) =>
  api.get("/api/audit-logs/company", { params });

export const getRecentLogins = (limit = 10) =>
  api.get("/api/audit-logs/recent-logins", { params: { limit } });

export const deleteAuditLog = (id) => api.delete(`/api/audit-logs/${id}`);

export function exportAuditLogs(params = {}, format = "csv") {
  return api.get("/api/audit-logs/export", {
    params: { ...params, format },
    responseType: "blob",
  });
}
