import api from './api';

export const accessService = {
  checkIn: async (deviceIds, entryPhoto) => {
    const response = await api.post('/access/check-in', { 
      device_ids: deviceIds,
      entry_photo: entryPhoto 
    });
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/access/check-out');
    return response.data;
  },

  getCurrentStatus: async () => {
    const response = await api.get('/access/status');
    return response.data;
  },

  getAccessHistory: async (options = {}) => {
    const response = await api.get('/access/history', { params: options });
    return response.data;
  },

  // Dashboard endpoints
  getRecentActivity: async (limit = 50) => {
    const response = await api.get('/access/dashboard/activity', { params: { limit } });
    return response.data;
  },

  getCurrentOccupancy: async () => {
    const response = await api.get('/access/dashboard/occupancy');
    return response.data;
  },

  getPersonalStats: async () => {
    const response = await api.get('/access/personal-stats');
    return response.data;
  }
};
