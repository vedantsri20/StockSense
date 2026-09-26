import api from './api';

export const receiptService = {
  async getReceipts(params = {}) {
    const response = await api.get('/receipts', { params });
    return response.data;
  },

  async getReceiptById(id) {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  },

  async createReceipt(receiptData) {
    const response = await api.post('/receipts', receiptData);
    return response.data;
  },

  async updateReceipt(id, receiptData) {
    const response = await api.put(`/receipts/${id}`, receiptData);
    return response.data;
  },

  async validateReceipt(id) {
    const response = await api.post(`/receipts/${id}/validate`);
    return response.data;
  },
};

export default receiptService;
