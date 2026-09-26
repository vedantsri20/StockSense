import api from './api';

export const adjustmentService = {
  async getAdjustments(params = {}) {
    const response = await api.get('/adjustments', { params });
    return response.data;
  },

  async getAdjustmentById(id) {
    const response = await api.get(`/adjustments/${id}`);
    return response.data;
  },

  async createAdjustment(adjustmentData) {
    const response = await api.post('/adjustments', adjustmentData);
    return response.data;
  },

  async validateAdjustment(id) {
    const response = await api.post(`/adjustments/${id}/validate`);
    return response.data;
  },
};

export default adjustmentService;
