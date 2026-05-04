export type RouterType = "API" | "SCRAPER";

export interface ConnectedDevice {
  mac: string;
  ip?: string;
  hostname?: string;
  manufacturer?:string;
  connection: {
    rssi?: number;
    band?: string;
    interface?: string;
    txRate?:string;
    rxRate?:string;
  };
  meta: {
    routerKey: string;
    routerName: string;
    routerType: RouterType;
    routerProvider?:string;
    ssidIndex?:number;
    iid?:number;
  };
  source: string;
  timeStamp:Date;
}

export interface RouterHealth {
  routerKey: string;
  routerName: string;
  routerType: RouterType;
  available: boolean;
  latencyMs: number;
  checkedAt: string;
  error?: string;
}

export interface RouterDiagnostics {
  key: string;
  name: string;
  type: RouterType;
  lastLoginAt?: string;
  lastFetchAt?: string;
  lastError?: string;
  sessionActive?: boolean;
}

export interface RouterAdapter {
  key: string;
  name: string;
  type: RouterType;

  login(): Promise<void>;
  fetchConnectedDevices(): Promise<ConnectedDevice[]>;
  healthCheck(): Promise<boolean>;
  fetchRawConnectedDevices?(): Promise<unknown>;
  getDiagnostics?(): RouterDiagnostics;
  close?(): Promise<void>;
}
