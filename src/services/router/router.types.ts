export interface RouterLoginResponse {
  Login?: {
    status_code?: number;
    data?: {
      login?: {
        status?: string;
        authenticatedToken?: string;
        easyPage?: boolean;
        defaultPage?: string;
      };
    };
  };
}

export interface RouterJwtPayload {
  SessionTimeout?: number;
  iat?: number;
}

export interface ConnectedDevice {
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
    ssidIndex: number;
    iid: number;
  };

  source: "router";
}