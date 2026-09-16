import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const careerService = {
  getJobRecommendations: async () => {
    const response = await api.get(API_ENDPOINTS.CAREER_JOBS);
    return response.data;
  },

  getLiveJobs: async () => {
    const response = await api.get(API_ENDPOINTS.CAREER_LIVE_JOBS);
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get(API_ENDPOINTS.ACHIEVEMENTS);
    return response.data;
  },

  createAchievement: async (data) => {
    const response = await api.post(API_ENDPOINTS.ACHIEVEMENTS, data);
    return response.data;
  },

  deleteAchievement: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.ACHIEVEMENTS}/${id}`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get(API_ENDPOINTS.RECOMMENDATIONS);
    return response.data;
  },
};

export default careerService;
