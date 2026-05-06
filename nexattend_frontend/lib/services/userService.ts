import { api } from '@/lib/api';

export interface UserPayload {
  email: string;
  password: string;
  role: 'ADMIN' | 'STUDENT' | 'MANAGER';
  profile?: {
    firstName: string;
    lastName: string;
    phoneNo?: string;
  };
}

export interface UserRecord {
  id: number;
  publicId?: string;
  email: string;
  role: string;
  profile?: {
    firstName: string;
    lastName: string;
    phoneNo?: string | null;
    department?: string | null;
    enrolmentNo?: string | null;
    year?: number | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkStudentPayload {
  students: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNo?: string;
    department?: string;
    enrolmentNo?: string;
    year?: number;
    deviceName?: string;
    macAddress?: string;
    devices?: Array<{
      deviceName?: string;
      macAddress: string;
    }>;
  }>;
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

  async bulkCreateStudents(payload: BulkStudentPayload) {
    const response = await api.post<{ data: { count: number; users: UserRecord[] } }>('/users/bulk-students', payload);
    return response.data.data;
  },
};
