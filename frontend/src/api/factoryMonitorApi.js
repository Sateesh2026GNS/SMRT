import api from "./axiosConfig";

export const getLiveProduction = () =>
  api.get("/factory-monitor/live-production");

export const getFactoryMachineStatus = () =>
  api.get("/factory-monitor/machine-status");

export const getProductionLines = () =>
  api.get("/factory-monitor/production-lines");
