import api from "./axiosConfig";

export const getCompanySettings = () => api.get("/settings/company");

export const updateCompanySettings = (payload) =>
  api.put("/settings/company", payload);

/** Live profile, subscription, and session details for the signed-in user. */
export const getAccountOverview = () => api.get("/settings/account-overview");

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? null;
}

/** Current subscription + trial flags + embedded plan catalog. */
export const getSubscription = () =>
  api.get("/settings/subscription").then((res) => ({ ...res, data: unwrap(res) }));

export const getSubscriptionPlans = () =>
  api.get("/settings/subscription/plans").then((res) => ({ ...res, data: unwrap(res) }));

export const getSubscriptionPlan = (planId) =>
  api.get(`/settings/subscription/plans/${planId}`).then((res) => ({ ...res, data: unwrap(res) }));

export const activateTrial = () =>
  api.post("/settings/subscription/activate-trial").then((res) => ({
    ...res,
    data: unwrap(res),
    message: res?.data?.message,
  }));

export const contactSales = (payload = {}) =>
  api.post("/settings/subscription/contact-sales", payload).then((res) => ({
    ...res,
    data: unwrap(res),
    message: res?.data?.message,
  }));
