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

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const fetchVisits = async (token) => {
  const { data } = await api.get("/admin/visits", auth(token));
  return data;
};

export const fetchMessages = async (token) => {
  const { data } = await api.get("/admin/messages", auth(token));
  return data;
};

export const markMessageRead = async (token, id, read) => {
  const { data } = await api.patch(`/admin/messages/${id}`, { read }, auth(token));
  return data.message;
};

export const replyToMessage = async (token, id, body) => {
  const { data } = await api.post(`/admin/messages/${id}/reply`, { body }, { ...auth(token), timeout: 30000 });
  return data.message;
};

export const deleteMessage = async (token, id) => {
  await api.delete(`/admin/messages/${id}`, auth(token));
};

export const sendChatMessage = async (messages) => {
  const { data } = await api.post("/chat", { messages });
  return data;
};

export default api;
