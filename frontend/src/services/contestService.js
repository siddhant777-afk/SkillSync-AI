import api from "./api";
import { API_ENDPOINTS } from "../constants/api";

const contestService = {
  getContests: async ({ platform = "all", status = "all", search = "", refresh = false } = {}) => {
    const params = new URLSearchParams();
    if (platform && platform !== "all") params.append("platform", platform);
    if (status && status !== "all") params.append("status", status);
    if (search && search.trim()) params.append("search", search.trim());
    if (refresh) params.append("refresh", "true");

    const endpoint = API_ENDPOINTS.CONTESTS || "/api/v1/contests";
    const queryString = params.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    const response = await api.get(url);
    return response.data;
  },
};

export default contestService;
