import api from "./axiosConfig";

export const seedProducts = () => api.post("/production/seed-products");

export const getProducts = () => api.get("/production/products");

export const getProductionOrders = () => api.get("/production/orders");

export const getProductionPlanningSummary = () =>
  api.get("/production/orders/summary");

export const getProductionOrderDetail = (orderId) =>
  api.get(`/production/orders/${orderId}`);

export const getProductionOrderStartChecks = (orderId) =>
  api.get(`/production/orders/${orderId}/start-checks`);

export const startProductionOrder = (orderId) =>
  api.post(`/production/orders/${orderId}/start`);

export const completeProductionOrder = (orderId) =>
  api.post(`/production/orders/${orderId}/complete`);

export const pauseProductionOrder = (orderId) =>
  api.post(`/production/orders/${orderId}/pause`);

export const createProductionOrder = (payload) =>
  api.post("/production/orders", payload);

export const updateProductionOrderStatus = (orderId, status) =>
  api.patch(`/production/orders/${orderId}/status`, null, { params: { status } });

export const getWorkOrders = (productionOrderId) =>
  api.get("/production/work-orders", {
    params: productionOrderId ? { production_order_id: productionOrderId } : {},
  });

export const getWorkOrderSummary = (productionOrderId) =>
  api.get("/production/work-orders/summary", {
    params: productionOrderId ? { production_order_id: productionOrderId } : {},
  });

export const getWorkOrderDetail = (workOrderId) =>
  api.get(`/production/work-orders/${workOrderId}`);

export const getWorkOrderStartChecks = (workOrderId) =>
  api.get(`/production/work-orders/${workOrderId}/start-checks`);

export const startWorkOrder = (workOrderId) =>
  api.post(`/production/work-orders/${workOrderId}/start`);

export const pauseWorkOrder = (workOrderId) =>
  api.post(`/production/work-orders/${workOrderId}/pause`);

export const stopWorkOrder = (workOrderId) =>
  api.post(`/production/work-orders/${workOrderId}/stop`);

export const completeWorkOrder = (workOrderId) =>
  api.post(`/production/work-orders/${workOrderId}/complete`);

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

export const getMachineSummary = () => api.get("/production/machines/summary");

export const getMachineDetail = (machineId) =>
  api.get(`/production/machines/${machineId}`);

export const createMachineFull = (payload) =>
  api.post("/production/machines/full", payload);

export const updateMachineFull = (machineId, payload) =>
  api.put(`/production/machines/${machineId}`, payload);

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

export const getAllocationSummary = () =>
  api.get("/production/allocation/summary");

export const getAllocations = () =>
  api.get("/production/allocation");

export const getAllocationMachines = () =>
  api.get("/production/allocation/machines");

export const assignAllocation = (payload) =>
  api.post("/production/allocation/assign", payload);

export const getBatchSummary = () =>
  api.get("/production/batches/summary");

export const getBatchesEnriched = () =>
  api.get("/production/batches/enriched");

export const getBatchDetail = (batchId) =>
  api.get(`/production/batches/${batchId}`);

export const getProductionHub = () =>
  api.get("/production/hub");
