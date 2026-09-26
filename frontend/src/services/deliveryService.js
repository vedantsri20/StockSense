import api from './api';

export const deliveryService = {
  async getDeliveries(params = {}) {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },

  async getDeliveryById(id) {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  async createDelivery(deliveryData) {
    const response = await api.post('/deliveries', deliveryData);
    return response.data;
  },

  async updateDelivery(id, deliveryData) {
    const response = await api.put(`/deliveries/${id}`, deliveryData);
    return response.data;
  },

  async validateDelivery(id) {
    const response = await api.post(`/deliveries/${id}/validate`);
    return response.data;
  },
};

export default deliveryService;
