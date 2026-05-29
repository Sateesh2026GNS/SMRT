import api from "./axiosConfig";

export const seedProducts = () => api.post("/production/seed-products");

export const getProducts = (tenantId) =>
  api.get("/production/products", { params: { tenant_id: tenantId } });

export const getProductionOrders = (tenantId) =>
  api.get("/production/orders", { params: { tenant_id: tenantId } });

export const createProductionOrder = (payload) =>
  api.post("/production/orders", payload);

export const getWorkOrders = (tenantId, productionOrderId) =>
  api.get("/production/work-orders", {
    params: {
      tenant_id: tenantId,
      production_order_id: productionOrderId,
    },
  });

export const createWorkOrder = (payload) =>
  api.post("/production/work-orders", payload);

export const quickCreateWorkOrder = (payload) =>
  api.post("/production/work-orders/quick", payload);

export const updateWorkOrder = (workOrderId, tenantId, payload) =>
  api.patch(`/production/work-orders/${workOrderId}`, payload, {
    params: { tenant_id: tenantId },
  });

export const updateMachineStatus = (machineId, tenantId, status) =>
  api.patch(`/production/machines/${machineId}`, { status }, {
    params: { tenant_id: tenantId },
  });

export const getBatches = (tenantId, workOrderId) =>
  api.get("/production/batches", {
    params: { tenant_id: tenantId, work_order_id: workOrderId },
  });

export const createBatch = (payload) => api.post("/production/batches", payload);

export const getMachines = (tenantId) =>
  api.get("/production/machines", { params: { tenant_id: tenantId } });

export const createMachine = (payload) =>
  api.post("/production/machines", payload);

export const getMachineStatusEvents = (tenantId, machineId) =>
  api.get("/production/machine-status", {
    params: { tenant_id: tenantId, machine_id: machineId },
  });

export const createMachineStatusEvent = (payload) =>
  api.post("/production/machine-status", payload);

export const getDailyReports = (tenantId, params = {}) =>
  api.get("/production/daily-reports", {
    params: { tenant_id: tenantId, ...params },
  });

export const createDailyReport = (payload) =>
  api.post("/production/daily-reports", payload);
