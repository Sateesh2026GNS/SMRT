import api from "./axiosConfig";

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function register(companyName, fullName, email, password, role) {
  const { data } = await api.post("/auth/register", {
    company_name: companyName,
    full_name: fullName,
    email,
    password,
    role,
  });
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

export async function forgotPassword(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await api.post("/auth/reset-password", { token, password });
  return data;
}
