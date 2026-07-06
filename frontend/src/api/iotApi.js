import api from "./axiosConfig";

export const getIotDashboard = () => api.get("/iot/dashboard");

export const getWearables = () => api.get("/iot/wearables");

export const getMachineAnalytics = () => api.get("/iot/machine-analytics");

export const getIotSensors = () => api.get("/iot/sensors");

export const getCobots = () => api.get("/iot/cobots");

export const getAgvs = () => api.get("/iot/agvs");

export const getDrones = () => api.get("/iot/drones");

export const getSmartPackaging = () => api.get("/iot/smart-packaging");

export const getLiveOperations = () => api.get("/iot/live-operations");
