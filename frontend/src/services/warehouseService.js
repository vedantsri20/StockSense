import api from './api';

export const warehouseService = {
  async getWarehouses() {
    const response = await api.get('/warehouses');
    return response.data;
  },

  async createWarehouse(warehouseData) {
    const response = await api.post('/warehouses', warehouseData);
    return response.data;
  },

  async updateWarehouse(id, warehouseData) {
    const response = await api.put(`/warehouses/${id}`, warehouseData);
    return response.data;
  },

  async deleteWarehouse(id) {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  },
};

export default warehouseService;
