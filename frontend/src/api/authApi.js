import api from "./axiosConfig";

export async function login(email, password, role) {
  const { data } = await api.post("/auth/login", { email, password, role });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function getProfile() {
  const { data } = await api.get("/auth/profile");
  return data;
}

export async function register(companyName, fullName, email, password, role = "Admin") {
  const { data } = await api.post("/auth/register", {
    company_name: companyName,
    full_name: fullName,
    email,
    password,
    role,
  });
  return data;
}

export async function getRegisterRoles() {
  const { data } = await api.get("/roles");
  return data;
}

export async function getSidebarMenus() {
  const { data } = await api.get("/sidebar");
  return data;
}

export async function getSidebarLabels() {
  const { data } = await api.get("/sidebar/labels");
  return data;
}

export async function getPermissionsCatalog() {
  const { data } = await api.get("/permissions");
  return data;
}

export async function getTenantRoles() {
  const { data } = await api.get("/roles/tenant");
  return data;
}

export async function refreshTokens(refreshToken) {
  const { data } = await api.post("/auth/refresh", { refresh_token: refreshToken });
  return data;
}

export async function logout(refreshToken) {
  const { data } = await api.post("/auth/logout", { refresh_token: refreshToken });
  return data;
}

export async function verifyEmail(token) {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
}

export async function resendVerification(email) {
  const { data } = await api.post("/auth/resend-verification", { email });
  return data;
}

/** Extract human-readable error from FastAPI or API envelope responses. */
export function getApiErrorMessage(err, fallback = "Something went wrong.") {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.errors) && data.errors.length) return data.errors[0];
  if (typeof data.errors === "string") return data.errors;
  if (typeof data.message === "string") return data.message;
  return fallback;
}

export async function forgotPassword(email) {
  const { data } = await api.post("/api/auth/forgot-password", { email });
  return data;
}

export async function validateResetToken(token) {
  const { data } = await api.get("/api/auth/validate-reset-token", {
    params: { token },
  });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await api.post("/api/auth/reset-password", { token, password });
  return data;
}
