import api from "./axiosConfig";

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function register(companyName, fullName, email, password) {
  const { data } = await api.post("/auth/register", {
    company_name: companyName,
    full_name: fullName,
    email,
    password,
  });
  return data;
}
