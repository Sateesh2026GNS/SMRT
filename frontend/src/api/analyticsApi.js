import api from "./axiosConfig";

export const getAnalyticsDashboard = (_tenantId, year = null) =>
  api.get("/analytics/dashboard", {
    params: { year: year || new Date().getFullYear() },
  });

export const getProductionTrend = (_tenantId, year = null) =>
  api.get("/analytics/production-trend", {
    params: { year: year || new Date().getFullYear() },
  });

export const getMachineEfficiency = () =>
  api.get("/analytics/machine-efficiency");

export const getInventoryTurnover = () =>
  api.get("/analytics/inventory-turnover");

export const getWorkerPerformance = () =>
  api.get("/analytics/worker-performance");

export const getProfitAnalysis = (_tenantId, year = null) =>
  api.get("/analytics/profit", {
    params: { year: year || new Date().getFullYear() },
  });
