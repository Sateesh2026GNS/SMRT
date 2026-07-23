import api from "./axiosConfig";
import {
  clearAllNotifications,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notificationService";

export const getAlerts = (params = {}) =>
  api.get("/alerts", { params: { ...params } }).then((res) => {
    // Normalize list envelope: { items, total } or legacy array
    const body = res.data;
    if (Array.isArray(body)) return { ...res, data: body };
    if (body?.items) return { ...res, data: body.items, meta: body };
    if (Array.isArray(body?.data)) return { ...res, data: body.data };
    return { ...res, data: [] };
  });

export const markAlertRead = (alertId) => api.put(`/alerts/${alertId}/read`);

export const markAllAlertsRead = () => api.post("/alerts/mark-all-read");

export const getAlert = (alertId) => api.get(`/alerts/${alertId}`);

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
  api.put(`/alerts/${alertId}/acknowledge`);

export const resolveAlert = (alertId) => api.put(`/alerts/${alertId}/resolve`);

export const deleteAlert = (alertId) => api.delete(`/alerts/${alertId}`);
