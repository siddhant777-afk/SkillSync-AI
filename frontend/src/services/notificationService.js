import api from './api';
import { API_ENDPOINTS } from '../constants/api';

const notificationService = {
  getNotifications: async () => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post(`${API_ENDPOINTS.NOTIFICATIONS}/mark-all-read`);
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`);
    return response.data;
  },

  syncJobs: async () => {
    const response = await api.post(`${API_ENDPOINTS.NOTIFICATIONS}/sync-jobs`);
    return response.data;
  },
};

export default notificationService;
