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

export const getProductionAnalytics = (year = null) =>
  api.get("/analytics/production/summary", {
    params: year ? { year } : {},
  });

export const getInventoryAnalytics = () =>
  api.get("/analytics/inventory/summary");

export const getSalesAnalytics = (year = null) =>
  api.get("/analytics/sales/summary", {
    params: year ? { year } : {},
  });

export const getFinanceAnalytics = (year = null) =>
  api.get("/analytics/finance/summary", {
    params: year ? { year } : {},
  });

export const getExecutiveHub = (year = null) =>
  api.get("/analytics/executive/hub", {
    params: year ? { year } : {},
  });

export const getLiveDashboard = () =>
  api.get("/analytics/live/hub");
