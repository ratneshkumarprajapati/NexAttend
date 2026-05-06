import { api } from '@/lib/api';

export interface ProfilePayload {
  userId: number;
  firstName: string;
  lastName: string;
  phoneNo: string;
  department: string;
  enrolmentNo: string;
  year: number;
  preprationGoal: {
    target: string;
    focus: string;
  };
}

export interface ProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  phoneNo?: string;
  department?: string;
  enrolmentNo?: string;
  year?: number;
  preprationGoal?: {
    target?: string;
    focus?: string;
  };
}

export interface ProfileRecord {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNo: string;
  department: string;
  enrolmentNo: string;
  year: number;
  preprationGoal: {
    target: string;
    focus: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const profileService = {
  async createProfile(payload: ProfilePayload) {
    const response = await api.post<{ data: ProfileRecord }>('/profiles/create', payload);
    return response.data.data;
  },

  async getProfileByUserId(userId: number) {
    const response = await api.get<{ data: ProfileRecord }>(`/profiles/${userId}`);
    return response.data.data;
  },

  async updateProfile(userId: number, payload: ProfileUpdatePayload) {
    const response = await api.put<{ data: ProfileRecord }>(`/profiles/${userId}`, payload);
    return response.data.data;
  },
};
