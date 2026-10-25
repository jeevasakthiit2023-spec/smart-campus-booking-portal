import { request } from './api';

export const equipmentService = {
  async getDashboardStats() {
    return await request('/dashboard/stats/');
  },

  async getCategories() {
    return await request('/categories/');
  },

  async getLabs() {
    return await request('/labs/');
  },

  async getEquipmentList(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.lab && params.lab !== 'all') query.append('lab', params.lab);
    if (params.condition && params.condition !== 'all') query.append('condition', params.condition);
    if (params.availableOnly) query.append('available_only', 'true');

    const queryString = query.toString();
    const endpoint = `/equipment/${queryString ? `?${queryString}` : ''}`;
    return await request(endpoint);
  },

  async getEquipmentById(id) {
    return await request(`/equipment/${id}/`);
  }
};
