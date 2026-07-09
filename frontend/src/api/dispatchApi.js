import api from "./axiosConfig";

export const getDispatchOrders = () => api.get("/dispatch/dispatch-orders");
export const getDeliveryStatus = () => api.get("/dispatch/delivery-status");
export const getShipmentTracking = () => api.get("/dispatch/shipment-tracking");
export const getDispatchSummary = () => api.get("/dispatch/summary");
export const getDispatchEnriched = () => api.get("/dispatch/enriched");
