export interface MobileDeviceEventMessage {
  id: string;
  source: "mobile-adapter";
  schemaVersion: 1;
  publishedAt: string;
  adapter: {
    id: string;
    name: string;
  };
  event: {
    event: "detected" | "disconnected" | "heartbeat";
    emailId: string;
    deviceId?: string;
    deviceName?: string;
    phoneNo?: string;
    ip?: string;
    platform?: string;
    appVersion?: string;
    batteryLevel?: number;
    networkType?: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    occurredAt: string;
    receivedAt: string;
  };
}
