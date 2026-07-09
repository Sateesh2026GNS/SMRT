import api from "./axiosConfig";

export const getBillOfMaterials = () => api.get("/products/bom");

export const getProductBom = (productId) => api.get(`/production/products/${productId}/bom`);

export const addBomItem = (productId, payload) =>
  api.post(`/production/products/${productId}/bom`, payload);

export const deleteBomItem = (bomId) => api.delete(`/production/products/bom/${bomId}`);
