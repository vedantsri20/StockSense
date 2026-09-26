import api from './api';

export const reorderingRuleService = {
  async getRules() {
    const response = await api.get('/reordering-rules');
    return response.data;
  },

  async createRule(ruleData) {
    const response = await api.post('/reordering-rules', ruleData);
    return response.data;
  },

  async updateRule(id, ruleData) {
    const response = await api.put(`/reordering-rules/${id}`, ruleData);
    return response.data;
  },

  async deleteRule(id) {
    const response = await api.delete(`/reordering-rules/${id}`);
    return response.data;
  },
};

export default reorderingRuleService;
