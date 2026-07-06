import api from "./axiosConfig";

export const getDocuments = (docType = null) =>
  api.get("/documents", { params: { doc_type: docType } });

export const createDocument = (payload) => api.post("/documents", payload);
