import axios from "axios";
import { getVisitorId } from "./visitorId";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

export const fetchGithubRepos = async (username) => {
  const { data } = await api.get(`/github/${username}/repos`);
  return data;
};

export const sendContactMessage = async (payload) => {
  const { data } = await api.post("/contact", { ...payload, visitorId: getVisitorId() });
  return data;
};

export const pingVisit = async (payload) => {
  const { data } = await api.post("/visit", payload);
  return data?.id;
};

export const sendVisitActivity = (id, payload) => {
  const url = `/api/visit/${encodeURIComponent(id)}/activity`;
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;
  } catch { /* fall through to fetch */ }
  fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
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

export const suggestReplies = async (token, id, draft = "") => {
  const { data } = await api.post(`/admin/messages/${id}/suggest`, { draft }, { ...auth(token), timeout: 45000 });
  return data.suggestions;
};

export const fetchChats = async (token) => {
  const { data } = await api.get("/admin/chats", auth(token));
  return data.chats;
};

export const fetchVisitorProfile = async (token, { visitorId, ip }) => {
  const { data } = await api.get("/admin/visitor", { ...auth(token), params: visitorId ? { visitorId } : { ip } });
  return data;
};

export const askAdminAi = async (token, messages) => {
  const { data } = await api.post("/admin/ai", { messages }, { ...auth(token), timeout: 45000 });
  return data.reply;
};

export const sendBriefingNow = async (token) => {
  await api.post("/admin/briefing/send", {}, { ...auth(token), timeout: 60000 });
};

export const deleteMessage = async (token, id) => {
  await api.delete(`/admin/messages/${id}`, auth(token));
};

export const sendChatMessage = async (messages) => {
  const { data } = await api.post("/chat", { messages, visitorId: getVisitorId() }, { timeout: 40000 });
  return data;
};

export default api;
