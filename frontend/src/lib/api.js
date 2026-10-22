import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

export const fetchGithubRepos = async (username) => {
  const { data } = await api.get(`/github/${username}/repos`);
  return data;
};

export const sendContactMessage = async (payload) => {
  const { data } = await api.post("/contact", payload);
  return data;
};

export const pingVisit = async (payload) => {
  await api.post("/visit", payload);
};

export const adminLogin = async (password) => {
  const { data } = await api.post("/admin/login", { password });
  return data;
};

export const fetchVisits = async (token) => {
  const { data } = await api.get("/admin/visits", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default api;
