import axios from "axios";

export const API_BASE_URL = "http://localhost:8000";
const TOKEN_KEY = "auth_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the bearer token to every request if available
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the token so the UI can redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      tokenStore.clear();
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const { data } = await api.post("/auth/jwt/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  tokenStore.set(data.access_token);
  return data;
};

export const register = async (email, password) => {
  const { data } = await api.post("/auth/register", { email, password });
  return data;
};

export const logout = async () => {
  try {
    await api.post("/auth/jwt/logout");
  } catch (_) {
    // ignore - we'll clear the token anyway
  }
  tokenStore.clear();
};

export const getMe = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

// Posts endpoints
export const getFeed = async () => {
  const { data } = await api.get("/feed");
  return data.posts;
};

export const uploadPost = async (file, caption, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("caption", caption);

  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return data;
};

export const deletePost = async (postId) => {
  const { data } = await api.delete(`/posts/${postId}`);
  return data;
};

// Helper to extract a user-friendly error message
export const errorMessage = (err) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  if (detail?.reason) return detail.reason;
  return err?.message || "Something went wrong";
};

export default api;
