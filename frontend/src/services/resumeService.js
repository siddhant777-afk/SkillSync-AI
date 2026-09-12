import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const resumeService = {
  getResume: async () => {
    const response = await api.get(API_ENDPOINTS.RESUME);
    return response.data;
  },

  updateResume: async (data) => {
    const response = await api.put(API_ENDPOINTS.RESUME, data);
    return response.data;
  },

  runAIReview: async (targetRole) => {
    const response = await api.post(API_ENDPOINTS.RESUME_AI_REVIEW, { target_role: targetRole });
    return response.data;
  },

  autoFillProfile: async () => {
    const response = await api.post(API_ENDPOINTS.RESUME_AUTO_FILL);
    return response.data;
  },
};


export default resumeService;
