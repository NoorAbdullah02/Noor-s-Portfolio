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

export default api;
