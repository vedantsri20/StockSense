import api from './api';

export const transferService = {
  async getTransfers(params = {}) {
    const response = await api.get('/transfers', { params });
    return response.data;
  },

  async getTransferById(id) {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },

  async createTransfer(transferData) {
    const response = await api.post('/transfers', transferData);
    return response.data;
  },

  async updateTransfer(id, transferData) {
    const response = await api.put(`/transfers/${id}`, transferData);
    return response.data;
  },

  async validateTransfer(id) {
    const response = await api.post(`/transfers/${id}/validate`);
    return response.data;
  },
};

export default transferService;
