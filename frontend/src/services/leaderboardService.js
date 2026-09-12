import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const leaderboardService = {
  getLeaderboard: async ({ college = "all", branch = "all", sortBy = "dsa" } = {}) => {
    const params = new URLSearchParams();
    if (college) params.append("college", college);
    if (branch) params.append("branch", branch);
    if (sortBy) params.append("sort_by", sortBy);

    const response = await api.get(`${API_ENDPOINTS.LEADERBOARD}?${params.toString()}`);
    return response.data;
  },
};

export default leaderboardService;
