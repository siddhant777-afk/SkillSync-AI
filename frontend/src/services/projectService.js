import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const projectService = {
  getProjects: async () => {
    const response = await api.get(API_ENDPOINTS.PROJECTS);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post(API_ENDPOINTS.PROJECTS, projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`${API_ENDPOINTS.PROJECTS}/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.PROJECTS}/${id}`, { data: {} });
    return response.data;
  },
};

export default projectService;
