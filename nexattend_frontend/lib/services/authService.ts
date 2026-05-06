import { api } from '@/lib/api';

export interface AuthRegisterPayload {
  email: string;
  password: string;
  role: 'STUDENT' | 'ADMIN' | 'MANAGER';
  firstName: string;
  lastName: string;
  phoneNo?: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  publicId?: string;
  email: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNo?: string;
  createdAt?: string;
}

export interface AuthResponse {
  data: {
    user: AuthUser;
    token: string;
  };
}

export const authService = {
  async register(payload: AuthRegisterPayload) {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data.data;
  },

  async login(payload: AuthLoginPayload) {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data.data;
  },
};
