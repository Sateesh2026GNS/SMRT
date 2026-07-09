import api from "./axiosConfig";

export const getProducts = () => api.get("/production/products");

export const getProductDetail = (id) => api.get(`/production/products/${id}`);

export const createProduct = (payload) => api.post("/production/products/manage", payload);

export const updateProduct = (id, payload) => api.patch(`/production/products/${id}`, payload);

export const deleteProduct = (id) => api.delete(`/production/products/${id}`);

export const getProductCatalog = () => api.get("/products/catalog");

export const getProductCategories = () => api.get("/products/categories");
