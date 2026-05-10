export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface DeviceRegisterPayload {
  deviceName: string;
  macAddress: string;
}

export interface DeviceRecord {
  id:          string;
  deviceName:  string;
  hashedMac?:  string;
  status?:     DeviceStatus | string;
  createdAt?:  string;
  lastSeen?:   string;
}

export interface DeviceFilters {
  status?: DeviceStatus | string;
  search?: string;
}

export interface DeviceState {
  filters: DeviceFilters;
}
