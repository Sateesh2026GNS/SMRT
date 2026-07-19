import api from "./axiosConfig";

export const getLoginHistory = (params = {}) =>
  api.get("/api/login-history", { params });

export const getMyLoginHistory = (params = {}) =>
  api.get("/api/login-history/me", { params });

export const getCompanyLoginHistory = (params = {}) =>
  api.get("/api/login-history/company", { params });

export const deleteLoginHistory = (id) =>
  api.delete(`/api/login-history/${id}`);
