import api from "./axiosConfig";

export const getWarehouses = () => api.get("/inventory/warehouses");

export const createWarehouse = (payload) =>
  api.post("/inventory/warehouses", payload);

export const getSuppliers = () => api.get("/inventory/suppliers");

export const createSupplier = (payload) =>
  api.post("/inventory/suppliers", payload);

export const getInventoryItems = (_tenantId, lowStockOnly = false) =>
  api.get("/inventory/items", {
    params: { low_stock_only: lowStockOnly },
  });

export const createInventoryItem = (payload) =>
  api.post("/inventory/items", payload);

export const getItemByBarcode = (_tenantId, barcode) =>
  api.get(`/inventory/items/barcode/${encodeURIComponent(barcode)}`);

export const getInventoryDashboard = (itemType) =>
  api.get("/inventory/dashboard", {
    params: itemType ? { item_type: itemType } : undefined,
  });

export const getStockByWarehouse = (warehouseId) =>
  api.get(`/inventory/stock-levels/warehouse/${warehouseId}`);

export const getStockByItem = (itemId) =>
  api.get(`/inventory/stock-levels/item/${itemId}`);

export const updateStock = (warehouseId, itemId, quantity) =>
  api.put("/inventory/stock-levels", null, {
    params: { warehouse_id: warehouseId, item_id: itemId, quantity },
  });

export const getStockMovements = (_tenantId, itemId) =>
  api.get("/inventory/stock-movements", {
    params: { item_id: itemId },
  });

export const getStockLedger = () => api.get("/warehouse/stock-transfers");

export const recordStockMovement = (payload) =>
  api.post("/inventory/stock-movements", payload);
