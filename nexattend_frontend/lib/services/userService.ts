import { api } from '@/lib/api';

export interface UserPayload {
  email: string;
  password: string;
  role: 'ADMIN' | 'STUDENT' | 'MANAGER';
}

export interface UserRecord {
  id: string;
  publicId?: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {
  async createUser(payload: UserPayload) {
    const response = await api.post<{ data: UserRecord }>('/users', payload);
    return response.data.data;
  },

  async getAllUsers() {
    const response = await api.get<{ data: UserRecord[] }>('/users');
    return response.data.data;
  },

  async getUserByPublicId(publicId: string) {
    const response = await api.get<{ data: UserRecord }>(`/users/${publicId}`);
    return response.data.data;
  },

  async updateUser(publicId: string, payload: Partial<UserPayload>) {
    const response = await api.put<{ data: UserRecord }>(`/users/${publicId}`, payload);
    return response.data.data;
  },

  async deleteUser(publicId: string) {
    const response = await api.delete<{ data: { success: boolean } }>(`/users/${publicId}`);
    return response.data.data;
  },
};
