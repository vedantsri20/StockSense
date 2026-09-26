import api from './api';

export const dashboardService = {
  async getDashboardStats(params = {}) {
    const response = await api.get('/dashboard', { params });
    return response.data;
  },
};

export default dashboardService;
