// Example API service file
// This demonstrates how to create API service methods for the NexAttend application

import { api } from '@/lib/api';
import { useAppDispatch } from '@/lib/hooks';
import { setAuthSuccess, setAuthError, setAuthLoading } from '@/lib/slices/authSlice';

// Example: Authentication service
export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};

// Example: Device service
export const deviceService = {
  async getAllDevices() {
    const response = await api.get('/devices');
    return response.data;
  },

  async registerDevice(data: { name: string; identifier: string; type: string }) {
    const response = await api.post('/devices', data);
    return response.data;
  },

  async updateDevice(id: string, data: any) {
    const response = await api.put(`/devices/${id}`, data);
    return response.data;
  },

  async deleteDevice(id: string) {
    const response = await api.delete(`/devices/${id}`);
    return response.data;
  },
};

// Example: Presence service
export const presenceService = {
  async getPresenceRecords() {
    const response = await api.get('/presence');
    return response.data;
  },

  async getTodayPresence() {
    const response = await api.get('/presence/today');
    return response.data;
  },

  async checkIn(deviceId: string) {
    const response = await api.post('/presence/check-in', { deviceId });
    return response.data;
  },

  async checkOut(deviceId: string) {
    const response = await api.post('/presence/check-out', { deviceId });
    return response.data;
  },
};

// Example: Attendance service
export const attendanceService = {
  async getAttendanceRecords(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/attendance?${params.toString()}`);
    return response.data;
  },

  async getAttendanceByUser(userId: string, month?: string) {
    const response = await api.get(`/attendance/${userId}?month=${month}`);
    return response.data;
  },

  async updateAttendance(id: string, data: any) {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  async deleteAttendance(id: string) {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};

// Example: Hook for using authentication in components
export function useAuth() {
  const dispatch = useAppDispatch();

  const login = async (email: string, password: string) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await authService.login(email, password);
      dispatch(setAuthSuccess({ user: response.user, token: response.accessToken }));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch(setAuthError(message));
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch(setAuthLoading(true));
    try {
      const response = await authService.register(name, email, password);
      dispatch(setAuthSuccess({ user: response.user, token: response.accessToken }));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch(setAuthError(message));
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch(setAuthError(''));
  };

  return { login, register, logout };
}
