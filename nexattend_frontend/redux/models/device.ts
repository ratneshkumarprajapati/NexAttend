export interface DeviceRecord {
  id: string;
  deviceName?: string | null;
  macAddress?: string | null;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  lastSeen?: string | null;
}
