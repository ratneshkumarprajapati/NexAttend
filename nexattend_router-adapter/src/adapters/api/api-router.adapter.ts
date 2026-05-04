import type { ApiRouterConfig } from "../../config/router.config.js";
import type { ConnectedDevice, RouterAdapter, RouterDiagnostics } from "../router.adapter.js";
import { retry, withTimeout } from "../../utils/async.js";
import { logger } from "../../utils/logger.js";
import { HttpClient } from "../../services/http/http.client.js";

// reuse your utility
const getByPath = (value: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
};

const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toStringOrNull = (v: unknown) => {
  if (v === null || v === undefined || v === "") return undefined;
  return String(v);
};

export class ApiRouterAdapter implements RouterAdapter {
  public readonly key: string;
  public readonly name: string;
  public readonly type = "API" as const;

  private token?: string;
  private tokenExpiresAt = 0;

  private lastLoginAt?: string;
  private lastFetchAt?: string;
  private lastError?: string;
  private routerClient:HttpClient;

  constructor(private readonly config: ApiRouterConfig) {
    this.key = config.key;
    this.name = config.name;
    this.routerClient=new HttpClient(config.baseUrl)
  }

  // LOGIN (fixed)
  async login(): Promise<void> {
    await retry(async () => {
      const response = await this.getData(this.config.loginApiUrl, {
        method: "POST",
        body: JSON.stringify({
          Login: {
            data: {
              username: this.config.username,
              password: this.config.password,
              captcha: "",
            },
          },
        }),
      });

      

      const statusCode = Number(getByPath(response, this.config.loginStatusCodePath));
      const status = String(getByPath(response, this.config.loginStatusPath) ?? "");
      const token = getByPath(response, this.config.loginTokenPath);

      if (
        statusCode !== 200 ||
        status !== this.config.loginSuccessStatus ||
        typeof token !== "string"
      ) {
        throw new Error(`Login failed for ${this.name}`);
      }

      this.token = token;

      // same logic as your working code
      this.tokenExpiresAt = this.getTokenExpiry(token);

      this.lastLoginAt = new Date().toISOString();
      this.lastError = undefined;
    }, this.config.retry);
  }

  async fetchConnectedDevices(): Promise<ConnectedDevice[]> {
    const raw = await this.fetchRawConnectedDevices();


    const rawDevices = getByPath(raw, this.config.connectedDevicesDataPath);
    const devices = Array.isArray(rawDevices) ? rawDevices : [];

    const fields = this.config.deviceFieldMap;

    const result = devices.map((d: unknown): ConnectedDevice => ({
      mac: String(getByPath(d, fields.mac) ?? "").toLowerCase(),
      ip: String(getByPath(d, fields.ip) ?? ""),

      hostname: toStringOrNull(getByPath(d, fields.hostname)),
      manufacturer: toStringOrNull(getByPath(d, fields.manufacturer)),

      connection: {
        band: String(getByPath(d, fields.band) ?? ""),
        rssi: toNumber(getByPath(d, fields.rssi)),
        txRate: String(getByPath(d, fields.txRate)),
        rxRate: String(getByPath(d, fields.rxRate)),
      },

      meta: {
        routerKey: this.key,
        routerName: this.name,
        routerType: this.config.type,
        routerProvider: this.config.provider,
        ssidIndex: toNumber(getByPath(d, fields.ssidIndex)),
        iid: toNumber(getByPath(d, fields.iid)),
      },

      source: "router",
      timeStamp: new Date()
    })).filter((d) => d.mac);

    this.lastFetchAt = new Date().toISOString();
    return result;
  }

  async fetchRawConnectedDevices(): Promise<unknown> {

    await this.ensureToken();

    return retry(
      () =>
        this.getData(this.config.connectedDevicesApiUrl, {
          method: "GET",
          auth: true,
        }),
      this.config.retry
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureToken();
      return true;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  getDiagnostics(): RouterDiagnostics {
    return {
      key: this.key,
      name: this.name,
      type: this.type,
      lastLoginAt: this.lastLoginAt,
      lastFetchAt: this.lastFetchAt,
      lastError: this.lastError,
      sessionActive: Boolean(this.token && Date.now() < this.tokenExpiresAt),
    };
  }

  private async ensureToken() {
    if (!this.token || Date.now() >= this.tokenExpiresAt) {
      await this.login();

    }
  }

  private async getData(
    path: string,
    options: { method: "GET" | "POST"; body?: string; auth?: boolean }
  ) {
    return withTimeout(async (signal) => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
        ...(options.auth && this.token
          ? { Authorization: `Bearer ${this.token}` }
          : {}),
      };

      let result: unknown;
      if (options.method === "GET") {
        result = await this.routerClient.get(path, { headers, timeout: this.config.timeoutMs });
      } else {
        const body = options.body ? JSON.parse(options.body) : undefined;
        result = await this.routerClient.post(path, body, { headers, timeout: this.config.timeoutMs });
      }

      return result;
    }, this.config.timeoutMs, `${this.key}:${path}`);
  }

 
  private getTokenExpiry(token: string) {
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return Date.now() + 25 * 60 * 1000;

      const payload = JSON.parse(
        Buffer.from(payloadPart, "base64url").toString("utf8")
      );

      if (payload.iat && payload.SessionTimeout) {
        return (payload.iat + payload.SessionTimeout - 30) * 1000;
      }
    } catch { }

    return Date.now() + 25 * 60 * 1000;
  }
}