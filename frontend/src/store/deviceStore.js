import { create } from 'zustand';
import { deviceService } from '../services/deviceService';

export const useDeviceStore = create((set) => ({
  devices: [],
  approvedDevices: [],
  pendingRequests: [],
  isLoading: false,
  error: null,

  // Get user's devices
  fetchMyDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await deviceService.getMyDevices();
      set({ devices: data.devices, isLoading: false });
      return data.devices;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch devices',
        isLoading: false,
      });
      throw error;
    }
  },

  // Get approved devices
  fetchApprovedDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await deviceService.getApprovedDevices();
      set({ approvedDevices: data.devices, isLoading: false });
      return data.devices;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch approved devices',
        isLoading: false,
      });
      throw error;
    }
  },

  // Create device
  createDevice: async (deviceData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await deviceService.createDevice(deviceData);
      set((state) => ({
        devices: [...state.devices, data.device],
        isLoading: false,
      }));
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create device',
        isLoading: false,
      });
      throw error;
    }
  },

  // Get pending requests (for managers)
  fetchPendingRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await deviceService.getPendingRequests();
      set({ pendingRequests: data.requests, isLoading: false });
      return data.requests;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch requests',
        isLoading: false,
      });
      throw error;
    }
  },

  // Approve device
  approveDevice: async (requestId, comments) => {
    set({ isLoading: true, error: null });
    try {
      const data = await deviceService.approveDevice(requestId, comments);
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
        isLoading: false,
      }));
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to approve device',
        isLoading: false,
      });
      throw error;
    }
  },

  // Reject device
  rejectDevice: async (requestId, comments) => {
    set({ isLoading: true, error: null });
    try {
      const data = await deviceService.rejectDevice(requestId, comments);
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
        isLoading: false,
      }));
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to reject device',
        isLoading: false,
      });
      throw error;
    }
  },
}));
