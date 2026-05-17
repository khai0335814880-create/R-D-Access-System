import { create } from 'zustand';
import { authService } from '../services/authService';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  token: sessionStorage.getItem('token'),
  isLoading: false,

  error: null,
  socket: null,

  connectSocket: () => {
    const { socket, token } = get();
    if (socket || !token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      set({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
      get().connectSocket();
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  qrLogin: async (qrData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.qrLogin(qrData);
      set({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
      get().connectSocket();
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'QR Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
      get().connectSocket();
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    get().disconnectSocket();
    authService.logout();
    set({ user: null, token: null });
  },

  updateUser: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
