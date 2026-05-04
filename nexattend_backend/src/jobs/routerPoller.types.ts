export interface Device {
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
