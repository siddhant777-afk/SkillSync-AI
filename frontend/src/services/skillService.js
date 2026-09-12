import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const skillService = {
  getSkills: async () => {
    const response = await api.get(API_ENDPOINTS.SKILLS);
    return response.data;
  },

  addSkill: async (skillData) => {
    const response = await api.post(API_ENDPOINTS.SKILLS, skillData);
    return response.data;
  },

  updateSkill: async (id, skillData) => {
    const response = await api.put(`${API_ENDPOINTS.SKILLS}/${id}`, skillData);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.SKILLS}/${id}`, { data: {} });
    return response.data;
  },
};

export default skillService;
