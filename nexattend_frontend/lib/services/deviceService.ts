import { api } from '@/lib/api';

export interface DeviceRegisterPayload {
  deviceName: string;
  macAddress: string;
}

export interface DeviceRecord {
  id: string;
  publicId?: string;
  deviceName: string;
  hashedMac?: string;
  status?: string;
  createdAt?: string;
  lastSeen?: string;
}

export const deviceService = {
  async registerDevice(payload: DeviceRegisterPayload) {
    const response = await api.post<{ data: DeviceRecord }>('/devices/register', payload);
    return response.data.data;
  },

  async getMyDevices() {
    const response = await api.get<{ data: DeviceRecord[] }>('/devices');
    return response.data.data;
  },
};
