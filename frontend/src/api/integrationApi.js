import api from "./axiosConfig";

export const getBarcodeScanners = () =>
  api.get("/integrations/barcode-scanners");

export const getAccountingSoftware = () =>
  api.get("/integrations/accounting-software");

export const getIotMachineIntegrations = () =>
  api.get("/integrations/iot-machines");

export const getApiIntegrations = () => api.get("/integrations/api-integrations");
