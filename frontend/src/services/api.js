import axios from "axios";
import { STORAGE_KEYS } from "../constants/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://skillsync-ai-1-o7w6.onrender.com" : "http://127.0.0.1:8000"),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/send-verification-code") ||
        url.includes("/auth/verify-email");

      if (!isAuthEndpoint) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        const base = import.meta.env.BASE_URL || "/";
        const loginPath = base.endsWith("/") ? `${base}login` : `${base}/login`;
        if (!window.location.pathname.endsWith("/login")) {
          window.location.assign(loginPath);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
