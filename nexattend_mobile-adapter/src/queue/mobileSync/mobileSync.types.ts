export type MobileDeviceEventType = "detected" | "disconnected" | "heartbeat";

export interface MobileDeviceEvent {
  event: MobileDeviceEventType;
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
}

export interface MobileDeviceEventMessage {
  id: string;
  source: "mobile-adapter";
  schemaVersion: 1;
  publishedAt: string;
  adapter: {
    id: string;
    name: string;
  };
  event: MobileDeviceEvent;
}

export interface MobileEventPublisher {
  publishEvent(event: MobileDeviceEvent): Promise<void>;
  close(): Promise<void>;
}
