import type { ConnectedDevice } from "../../services/router/router.types.js";

export interface RouterSnapshotFailure {
  routerKey: string;
  routerName: string;
  error: string;
}

export interface RouterSnapshotMessage {
  id: string;
  source: "router-adapter";
  schemaVersion: 1;
  publishedAt: string;
  snapshot: {
    devices: ConnectedDevice[];
    failures: RouterSnapshotFailure[];
    timestamp: string;
  };
}
