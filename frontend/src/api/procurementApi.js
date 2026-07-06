import api from "./axiosConfig";

export const getPurchaseOrders = () =>
  api.get("/procurement/purchase-orders");

export const createPurchaseOrder = (payload) =>
  api.post("/procurement/purchase-orders", payload);

export const updatePurchaseOrderStatus = (poId, status) =>
  api.patch(`/procurement/purchase-orders/${poId}/status`, null, {
    params: { status },
  });

export const getVendors = () => api.get("/procurement/vendors");

export const updateVendorApproval = (vendorId, status) =>
  api.patch(`/procurement/vendors/${vendorId}/approval`, null, {
    params: { status },
  });

export const getMaterialRequests = () =>
  api.get("/procurement/material-requests");

export const createMaterialRequest = (payload) =>
  api.post("/procurement/material-requests", payload);

export const getGoodsReceipts = () =>
  api.get("/procurement/goods-receipt");

export const createGoodsReceipt = (payload) =>
  api.post("/procurement/goods-receipt", payload);

export const getSupplierPayments = () =>
  api.get("/procurement/supplier-payments");

export const createSupplierPayment = (payload) =>
  api.post("/procurement/supplier-payments", payload);
