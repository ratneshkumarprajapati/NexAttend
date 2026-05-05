import axios from "axios";
import { env } from "../../config/env.js";
import { createModuleLogger } from "../../utils/logger.js";
import type { ConnectedDevice } from "./router.types.js";

const logger = createModuleLogger("RouterAdapter");

interface RouterAdapterDevice {
  mac: string;
  ip?: string;
  hostname?: string;
  connection?: {
    rssi?: number;
    band?: string;
    interface?: string;
  };
  meta?: {
    routerKey?: string;
    routerName?: string;
    routerType?: "API" | "SCRAPER";
  };
  timestamp?: string;
}

interface RouterAdapterDevicesResponse {
  devices: RouterAdapterDevice[];
  timestamp?: string;
  failures?: Array<{
    routerKey: string;
    routerName: string;
    error: string;
  }>;
}

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toStringOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
};

class RouterAdapterClient {
  private readonly client = axios.create({
    baseURL: env.ROUTER.ADAPTER_BASE_URL,
    timeout: 10000,
    headers: {
      Accept: "application/json",
    },
  });

  async fetchConnectedDevices(): Promise<ConnectedDevice[]> {
    const response = await this.client.get<RouterAdapterDevicesResponse>("/devices");

    if (response.data.failures?.length) {
      logger.warn("Partial router failures", {
        failures: response.data.failures,
      });
    }

    const devices = Array.isArray(response.data.devices)
      ? response.data.devices
      : [];

    return devices
      .map((device): ConnectedDevice => ({
        mac: String(device.mac ?? "").toLowerCase(),
        ip: String(device.ip ?? ""),
        hostname: toStringOrNull(device.hostname),
        manufacturer: null,
        connection: {
          band: String(device.connection?.band ?? device.connection?.interface ?? ""),
          rssi: toNumber(device.connection?.rssi),
          txRate: 0,
          rxRate: 0,
        },
        session: {
          duration: 0,
          expireTime: 0,
        },
        meta: {
          routerKey: String(device.meta?.routerKey ?? "router-adapter"),
          routerName: String(device.meta?.routerName ?? "Router Adapter"),
          routerProvider: String(device.meta?.routerType ?? "router-adapter"),
          ssidIndex: 0,
          iid: 0,
        },
        source: "router",
      }))
      .filter((device) => device.mac);
  }
}

export const routerAdapterClient = new RouterAdapterClient();
