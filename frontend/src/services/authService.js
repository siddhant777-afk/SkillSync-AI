import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const authService = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  loginRequestOtp: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN_REQUEST_OTP, credentials);
    return response.data;
  },

  loginVerifyOtp: async ({ email, code }) => {
    const response = await api.post(API_ENDPOINTS.LOGIN_VERIFY_OTP, { email, code });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.CURRENT_USER);
    return response.data;
  },

  sendVerificationCode: async (email) => {
    const response = await api.post("/api/v1/auth/send-verification-code", { email });
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await api.post("/api/v1/auth/verify-email", { email, code });
    return response.data;
  },
};

export default authService;