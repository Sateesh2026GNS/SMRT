import api from "./axiosConfig";

export const getSupplierPerformance = () =>
  api.get("/supply-chain/supplier-performance");

export const getPurchaseForecast = () =>
  api.get("/supply-chain/purchase-forecast");

export const getDeliveryTracking = () =>
  api.get("/supply-chain/delivery-tracking");

export const getSupplyReports = () => api.get("/supply-chain/supply-reports");
