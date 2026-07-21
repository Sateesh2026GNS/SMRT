import api from "./axiosConfig";

function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return { ...res, data: body.data };
  }
  return res;
}

export const getLiveProduction = () =>
  api.get("/factory-monitor/live-production");

export const getFactoryMachineStatus = () =>
  api.get("/factory-monitor/machine-status");

export const getProductionLines = () =>
  api.get("/factory-monitor/production-lines");

export const getShopFloorSummary = () =>
  api.get("/factory-monitor/shop-floor/summary");

export const getShopFloorGrid = () =>
  api.get("/factory-monitor/shop-floor/grid");

export const getShopFloorAlerts = () =>
  api.get("/factory-monitor/shop-floor/alerts");

export const getShopFloorTimeline = () =>
  api.get("/factory-monitor/shop-floor/timeline");
