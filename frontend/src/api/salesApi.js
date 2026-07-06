import api from "./axiosConfig";

export const getCustomers = () => api.get("/sales/customers");

export const createCustomer = (payload) =>
  api.post("/sales/customers", payload);

export const getSalesOrders = (_tenantId, status = null) =>
  api.get("/sales/sales-orders", {
    params: { status },
  });

export const getSalesOrderDetail = (orderId) =>
  api.get(`/sales/sales-orders/${orderId}`);

export const createSalesOrder = (payload) =>
  api.post("/sales/sales-orders", payload);

export const getInvoices = (_tenantId, status = null) =>
  api.get("/sales/invoices", {
    params: { status },
  });

export const getInvoiceDetail = (invoiceId) =>
  api.get(`/sales/invoices/${invoiceId}`);

export const createInvoice = (payload) =>
  api.post("/sales/invoices", payload);

export const getPayments = (_tenantId, invoiceId = null) =>
  api.get("/sales/payments", {
    params: { invoice_id: invoiceId },
  });

export const createPayment = (payload) =>
  api.post("/sales/payments", payload);

export const getLeads = (status = null) =>
  api.get("/sales/leads", { params: { status } });

export const createLead = (payload) => api.post("/sales/leads", payload);

export const updateLeadStatus = (leadId, status) =>
  api.patch(`/sales/leads/${leadId}/status`, null, { params: { status } });

export const getQuotations = (status = null) =>
  api.get("/sales/quotations", { params: { status } });

export const createQuotation = (payload) =>
  api.post("/sales/quotations", payload);

export const updateQuotationStatus = (quoteId, status) =>
  api.patch(`/sales/quotations/${quoteId}/status`, null, { params: { status } });

export const updateSalesOrderDispatch = (orderId, flags) =>
  api.patch(`/sales/sales-orders/${orderId}/dispatch`, null, { params: flags });
