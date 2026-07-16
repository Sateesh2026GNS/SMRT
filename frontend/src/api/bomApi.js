import api from "./axiosConfig";

function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return { ...res, data: body.data };
  }
  return res;
}

export const getAllBom = async () => unwrap(await api.get("/api/masters/bom"));

<<<<<<< HEAD
/** Alias used by BomMaster page */
export const getBillOfMaterials = getAllBom;

=======
export const getBillOfMaterials = getAllBom;


>>>>>>> 42502626 (first commit)
export const getProductBom = async (productId) =>
  unwrap(await api.get(`/api/masters/bom/product/${productId}`));

export const addBomItem = async (productId, payload) =>
  unwrap(await api.post("/api/masters/bom", { ...payload, product_id: productId }));

export const deleteBomItem = async (bomId) =>
  unwrap(await api.delete(`/api/masters/bom/${bomId}`));
