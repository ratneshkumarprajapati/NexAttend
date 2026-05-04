export interface DeviceConnectedPayload {
  mac: string;
  ip: string;
  rssi?: number;
  timestamp: Date;
}

export interface DeviceDisconnectedPayload {
  mac: string;
  timestamp: Date;
}