import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const recruiterService = {
  getCandidates: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    if (filters.minScore) params.append("min_score", filters.minScore);
    if (filters.minLeetcode) params.append("min_leetcode", filters.minLeetcode);
    if (filters.skill) params.append("skill", filters.skill);

    const url = `${API_ENDPOINTS.RECRUITER_CANDIDATES}?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },
};

export default recruiterService;
