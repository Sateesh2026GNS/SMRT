import api from "./axiosConfig";

function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return { ...res, data: body.data };
  }
  return res;
}

export const getProducts = async () => unwrap(await api.get("/api/masters/products"));

export const getProductDetail = async (id) => unwrap(await api.get(`/api/masters/products/${id}`));

export const createProduct = async (payload) => unwrap(await api.post("/api/masters/products", payload));

export const updateProduct = async (id, payload) =>
  unwrap(await api.put(`/api/masters/products/${id}`, payload));

export const deleteProduct = async (id) => unwrap(await api.delete(`/api/masters/products/${id}`));
