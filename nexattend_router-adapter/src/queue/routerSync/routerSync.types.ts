import type { AggregatedDevices } from "../../aggregator/router.aggregator.js";

export interface RouterSyncPublisher {
  publishSnapshot(snapshot: AggregatedDevices): Promise<void>;
  close(): Promise<void>;
}

export interface QueueConnectedDevice {
  mac: string;
  ip: string;
  hostname: string | null;
  manufacturer: string | null;
  connection: {
    band: string;
    rssi: number;
    txRate: number;
    rxRate: number;
  };
  session: {
    duration: number;
    expireTime: number;
  };
  meta: {
    routerKey: string;
    routerName: string;
    routerProvider: string;
    ssidIndex: number;
    iid: number;
  };
  source: "router";
}

export interface RouterSnapshotMessage {
  id: string;
  source: "router-adapter";
  schemaVersion: 1;
  publishedAt: string;
  snapshot: {
    devices: QueueConnectedDevice[];
    failures: AggregatedDevices["failures"];
    timestamp: string;
  };
}
