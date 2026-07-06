import api from "./axiosConfig";

export const seedProducts = () => api.post("/production/seed-products");

export const getProducts = () => api.get("/production/products");

export const getProductionOrders = () => api.get("/production/orders");

export const createProductionOrder = (payload) =>
  api.post("/production/orders", payload);

export const updateProductionOrderStatus = (orderId, status) =>
  api.patch(`/production/orders/${orderId}/status`, null, { params: { status } });

export const getWorkOrders = (_tenantId, productionOrderId) =>
  api.get("/production/work-orders", {
    params: { production_order_id: productionOrderId },
  });

export const createWorkOrder = (payload) =>
  api.post("/production/work-orders", payload);

export const quickCreateWorkOrder = (payload) =>
  api.post("/production/work-orders/quick", payload);

export const updateWorkOrder = (workOrderId, _tenantId, payload) =>
  api.patch(`/production/work-orders/${workOrderId}`, payload);

export const updateMachineStatus = (machineId, _tenantId, status) =>
  api.patch(`/production/machines/${machineId}`, { status });

export const getBatches = (_tenantId, workOrderId) =>
  api.get("/production/batches", {
    params: { work_order_id: workOrderId },
  });

export const createBatch = (payload) => api.post("/production/batches", payload);

export const getMachines = () => api.get("/production/machines");

export const createMachine = (payload) =>
  api.post("/production/machines", payload);

export const getMachineStatusEvents = (_tenantId, machineId) =>
  api.get("/production/machine-status", {
    params: { machine_id: machineId },
  });

export const createMachineStatusEvent = (payload) =>
  api.post("/production/machine-status", payload);

export const getDailyReports = (_tenantId, params = {}) =>
  api.get("/production/daily-reports", {
    params: { ...params },
  });

export const createDailyReport = (payload) =>
  api.post("/production/daily-reports", payload);
