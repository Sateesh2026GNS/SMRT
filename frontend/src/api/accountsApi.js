import api from "./axiosConfig";

export const getAccountsDashboard = () => api.get("/accounts/dashboard");

export const getProfitLoss = (_tenantId, year, ytdMonth = 12) =>
  api.get("/accounts/profit-loss", {
    params: { year, ytd_month: ytdMonth },
  });

export const getTaxReport = (_tenantId, year) =>
  api.get("/accounts/tax-report", {
    params: { year },
  });

export const listIncome = (_tenantId, year = null) =>
  api.get("/accounts/income", {
    params: { year },
  });

export const listExpenses = (_tenantId, year = null) =>
  api.get("/accounts/expenses", {
    params: { year },
  });

export const createIncome = (payload) => api.post("/accounts/income", payload);
export const createExpense = (payload) => api.post("/accounts/expenses", payload);
