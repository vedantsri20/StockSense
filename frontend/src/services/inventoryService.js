import api from './api';

export const inventoryService = {
  async getTransactions(params = {}) {
    const response = await api.get('/inventory/transactions', { params });
    return response.data;
  },

  async getSummary() {
    const response = await api.get('/inventory/summary');
    return response.data;
  },
};

export default inventoryService;
