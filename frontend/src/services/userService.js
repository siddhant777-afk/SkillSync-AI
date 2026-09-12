import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const userService = {
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.USER_PROFILE);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put(API_ENDPOINTS.USER_PROFILE, data);
    return response.data;
  },

  getCodingProfiles: async () => {
    const response = await api.get(API_ENDPOINTS.USER_CODING_PROFILES);
    return response.data;
  },

  updateCodingProfiles: async (data) => {
    const response = await api.put(API_ENDPOINTS.USER_CODING_PROFILES, data);
    return response.data;
  },

  syncAccounts: async () => {
    const response = await api.post(API_ENDPOINTS.SYNC_ACCOUNTS);
    return response.data;
  },

  verifyPlatform: async (platform, username) => {
    const response = await api.post(API_ENDPOINTS.VERIFY_PLATFORM, { platform, username });
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put(API_ENDPOINTS.SETTINGS, data);
    return response.data;
  },
};

export default userService;
