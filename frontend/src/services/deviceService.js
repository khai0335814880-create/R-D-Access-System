import api from './api';

export const deviceService = {
  // Device management
  createDevice: async (deviceData) => {
    const response = await api.post('/devices', deviceData);
    return response.data;
  },

  getMyDevices: async () => {
    const response = await api.get('/devices/my-devices');
    return response.data;
  },

  getApprovedDevices: async () => {
    const response = await api.get('/devices/approved');
    return response.data;
  },

  getAllDevices: async () => {
    const response = await api.get('/devices/all');
    return response.data;
  },

  updateDevice: async (id, updateData) => {
    const response = await api.put(`/devices/${id}`, updateData);
    return response.data;
  },

  getDeviceQR: async (id) => {
    const response = await api.get(`/devices/${id}/qr`);
    return response.data;
  },

  deleteDevice: async (id) => {
    const response = await api.delete(`/devices/${id}`);
    return response.data;
  },

  confirmQuickRegister: async (payload) => {
    const response = await api.post('/devices/quick-confirm', payload);
    return response.data;
  },

  // Approval requests
  getPendingRequests: async () => {
    const response = await api.get('/devices/requests/pending');
    return response.data;
  },

  approveDevice: async (requestId, comments) => {
    const response = await api.post(`/devices/requests/${requestId}/approve`, { comments });
    return response.data;
  },

  rejectDevice: async (requestId, comments) => {
    const response = await api.post(`/devices/requests/${requestId}/reject`, { comments });
    return response.data;
  },
};
