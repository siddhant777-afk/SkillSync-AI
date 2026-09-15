import api from "./api";

const contestService = {
  getContests: async ({ platform = "all", status = "all", search = "", refresh = false } = {}) => {
    const params = new URLSearchParams();
    if (platform && platform !== "all") params.append("platform", platform);
    if (status && status !== "all") params.append("status", status);
    if (search && search.trim()) params.append("search", search.trim());
    if (refresh) params.append("refresh", "true");

    const response = await api.get(`/contests?${params.toString()}`);
    return response.data;
  },
};

export default contestService;
