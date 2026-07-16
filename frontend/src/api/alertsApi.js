import api from "./axiosConfig";
import {
  clearAllNotifications,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notificationService";

export const getAlerts = (params = {}) =>
  api.get("/alerts", { params: { ...params } });

/** @deprecated Use notificationService.fetchNotifications */
export const getNotifications = () => fetchNotifications();

/** @deprecated Use notificationService.markNotificationRead / markAllNotificationsRead */
export const markNotificationsRead = (notificationIds = null) => {
  if (!notificationIds?.length) return markAllNotificationsRead();
  return markNotificationRead(notificationIds[0]);
};

/** @deprecated Use notificationService.clearAllNotifications */
export const clearNotifications = () => clearAllNotifications();

export const syncLowStockAlerts = () => api.post("/alerts/sync-low-stock");

export const createAlert = (payload) => api.post("/alerts", payload);

export const acknowledgeAlert = (alertId) =>
  api.post(`/alerts/${alertId}/acknowledge`);
