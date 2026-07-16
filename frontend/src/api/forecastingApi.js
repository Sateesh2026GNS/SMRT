import api from "./axiosConfig";

export const getProductionForecast = () =>
  api.get("/forecasting/production-forecast");

export const getDemandForecast = () => api.get("/forecasting/demand-forecast");

export const getInventoryForecast = () =>
  api.get("/forecasting/inventory-forecast");
