import { env } from "../../config/env.js";
import { HttpClient } from "../http/http.client.js";
import type { ConnectedDevice, RouterJwtPayload, RouterLoginResponse } from "./router.types.js";
import logger from "../../utils/logger.js";

type RouterConfig = (typeof env.ROUTER.CONFIGS)[number];

const getByPath = (value: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, value);
};

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


class RouterService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private routerClient: HttpClient;

  constructor(private config: RouterConfig) {
    this.routerClient = new HttpClient(config.baseUrl);
  }

  private getTokenExpiry(token: string) {
    try {
      const payloadPart = token.split(".")[1];

      if (!payloadPart) {
        return Date.now() + 25 * 60 * 1000;
      }

      const payload = JSON.parse(
        Buffer.from(payloadPart, "base64url").toString("utf8")
      ) as RouterJwtPayload;

      if (payload.iat && payload.SessionTimeout) {
        return (payload.iat + payload.SessionTimeout - 30) * 1000;
      }
    } catch {
      // Fall back to a conservative timeout if the router changes token format.
    }

    return Date.now() + 25 * 60 * 1000;
  }

  private async login() {
    const res = await this.routerClient.post<RouterLoginResponse>(
      this.config.loginApiUrl,
      {
        Login: {
          data: {
            username: this.config.username,
            password: this.config.password,
            captcha: "",
          },
        },
      }
    );

    const statusCode = Number(getByPath(res, this.config.loginStatusCodePath));
    const status = String(getByPath(res, this.config.loginStatusPath) ?? "");
    const token = getByPath(res, this.config.loginTokenPath);

    if (
      statusCode !== 200 ||
      status !== this.config.loginSuccessStatus ||
      typeof token !== "string"
    ) {
      throw new Error(`Router login failed for ${this.config.name}`);
    }

    this.token = token;
    this.tokenExpiry = this.getTokenExpiry(token);
  }

  private async ensureAuth() {
    if (!this.token || !this.tokenExpiry || Date.now() > this.tokenExpiry) {
      await this.login();
    }
  }

  private async request<T>(apiUrl: string) {
    await this.ensureAuth();

    try {
      const response = await this.routerClient.get<T>(apiUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response
    } catch (error: any) {
      if (error.message.includes("401")) {
        await this.login();

        return this.routerClient.get<T>(apiUrl, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      }

      logger.error(error)
      throw error;
    }
  }

  async fetchConnectedDevices() {
    const data = await this.request<any>(this.config.connectedDevicesApiUrl);

    const rawDevices = getByPath(data, this.config.connectedDevicesDataPath);
    const devices = Array.isArray(rawDevices) ? rawDevices : [];
    const fields = this.config.deviceFieldMap;
    // console.table(rawDevices)
    return devices.map((d: unknown):ConnectedDevice => ({
      mac: String(getByPath(d, fields.mac) ?? "").toLowerCase(), // normalize
      ip: String(getByPath(d, fields.ip) ?? ""),

      hostname: toStringOrNull(getByPath(d, fields.hostname)),
      manufacturer: toStringOrNull(getByPath(d, fields.manufacturer)),

      connection: {
        band: String(getByPath(d, fields.band) ?? ""), // 2.4G / 5G
        rssi: toNumber(getByPath(d, fields.rssi)),     // signal strength
        txRate: toNumber(getByPath(d, fields.txRate)),
        rxRate: toNumber(getByPath(d, fields.rxRate)),
      },

      session: {
        duration: toNumber(getByPath(d, fields.duration)), // seconds connected
        expireTime: toNumber(getByPath(d, fields.expireTime)),
      },

      meta: {
        routerKey: this.config.key,
        routerName: this.config.name,
        routerProvider: this.config.provider,
        ssidIndex: toNumber(getByPath(d, fields.ssidIndex)),
        iid: toNumber(getByPath(d, fields.iid)),
      },

      source: "router",
    })).filter((device) => device.mac);
  }
}

export const routerServices = env.ROUTER.CONFIGS
  .sort((a, b) => a.priority - b.priority)
  .map((config) => new RouterService(config));

export const routerService = routerServices[0] ?? new RouterService(env.ROUTER.CONFIGS[0]!);
