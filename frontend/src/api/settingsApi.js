import api from "./axiosConfig";

export const getCompanySettings = () => api.get("/settings/company");

export const updateCompanySettings = (payload) =>
  api.put("/settings/company", payload);
