import { z } from "zod";

const RetrySchema = z.object({
  attempts: z.number().int().positive().default(2),
  delayMs: z.number().int().nonnegative().default(300),
});

const BaseRouterSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  provider: z.string().default("generic"),
  enabled: z.boolean().default(true),
  priority: z.number().int().default(100),
  timeoutMs: z.number().int().positive().default(5000),
  retry: RetrySchema.default({}),
});

const ApiRouterSchema = BaseRouterSchema.extend({
  type: z.literal("API"),
  baseUrl: z.string().url(),
  username: z.string(),
  password: z.string(),
  loginApiUrl: z.string(),
  connectedDevicesApiUrl: z.string(),
  healthPath: z.string().optional(),
  loginStatusCodePath: z.string(),
  loginStatusPath: z.string(),
  loginSuccessStatus: z.string(),
  loginTokenPath: z.string(),
  connectedDevicesDataPath: z.string(),
  deviceFieldMap: z.object({
    mac: z.string(),
    ip: z.string(),
    hostname: z.string(),
    manufacturer: z.string(),
    band: z.string(),
    rssi: z.string(),
    txRate: z.string(),
    rxRate: z.string(),
    duration: z.string(),
    expireTime: z.string(),
    ssidIndex: z.string(),
    iid: z.string(),
  }),
  tokenTtlMs: z.number().int().positive().default(5 * 60 * 1000),
});

const ScraperRouterSchema = BaseRouterSchema.extend({
  type: z.literal("SCRAPER"),
  baseUrl: z.string().url(),
  loginPath: z.string(),
  username: z.string(),
  password: z.string(),
  headless: z.boolean().default(true),
  selectors: z.object({
    loggedIn: z.string(),
    username: z.string(),
    password: z.string(),
    submit: z.string(),
    statusLink: z.string(),
    localDevicesLink: z.string(),
    contentFrame: z.string(),
    readyText: z.string(),
    rows: z.string(),
  }),
});

export const RouterConfigSchema = z.discriminatedUnion("type", [
  ApiRouterSchema,
  ScraperRouterSchema,
]);

export type RouterConfig = z.infer<typeof RouterConfigSchema>;
export type ApiRouterConfig = z.infer<typeof ApiRouterSchema>;
export type ScraperRouterConfig = z.infer<typeof ScraperRouterSchema>;

export function createDefaultRouters(env: NodeJS.ProcessEnv): RouterConfig[] {
  return [
    {
      type: "API",
      key: env.ROUTER_KEY || "default",
      name: env.ROUTER_NAME || "Default Router",
      provider: env.ROUTER_PROVIDER || "generic",
      baseUrl: env.ROUTER_BASE_URL || "https://192.168.1.1",
      username: env.ROUTER_USERNAME || "admin",
      password: env.ROUTER_PASSWORD || "admin",
      loginApiUrl: env.ROUTER_LOGIN_API_URL || "/dm/sys/?cmd=Login",
      connectedDevicesApiUrl:
        env.ROUTER_CONNECTED_DEVICES_API_URL ||
        "/dm/tr98/?objs=WLANAssociatedDevice&page=StatusPage-CurrentWirelessUser",
      loginStatusCodePath: env.ROUTER_LOGIN_STATUS_CODE_PATH || "Login.status_code",
      loginStatusPath: env.ROUTER_LOGIN_STATUS_PATH || "Login.data.login.status",
      loginSuccessStatus: env.ROUTER_LOGIN_SUCCESS_STATUS || "success",
      loginTokenPath:
        env.ROUTER_LOGIN_TOKEN_PATH || "Login.data.login.authenticatedToken",
      connectedDevicesDataPath:
        env.ROUTER_CONNECTED_DEVICES_DATA_PATH || "WLANAssociatedDevice.data",
      deviceFieldMap: {
        mac: env.ROUTER_FIELD_MAC || "associatedDeviceMACAddress",
        ip: env.ROUTER_FIELD_IP || "associatedDeviceIPAddress",
        hostname: env.ROUTER_FIELD_HOSTNAME || "associatedDeviceHostName",
        manufacturer:
          env.ROUTER_FIELD_MANUFACTURER || "associatedDeviceManufacturer",
        band: env.ROUTER_FIELD_BAND || "associatedDeviceStandard",
        rssi: env.ROUTER_FIELD_RSSI || "associatedDeviceRSSI",
        txRate: env.ROUTER_FIELD_TX_RATE || "associatedDeviceTxRate",
        rxRate: env.ROUTER_FIELD_RX_RATE || "associatedDeviceRecvRate",
        duration: env.ROUTER_FIELD_DURATION || "associatedDeviceDuration",
        expireTime: env.ROUTER_FIELD_EXPIRE_TIME || "associatedDeviceExpireTime",
        ssidIndex: env.ROUTER_FIELD_SSID_INDEX || "associatedDeviceSSIDIndex",
        iid: env.ROUTER_FIELD_IID || "iid",
      },
      timeoutMs: Number(env.ROUTER_TIMEOUT_MS) || 5000,
      retry: {
        attempts: Number(env.ROUTER_RETRY_ATTEMPTS) || 2,
        delayMs: Number(env.ROUTER_RETRY_DELAY_MS) || 300,
      },
      tokenTtlMs: Number(env.ROUTER_TOKEN_TTL_MS) || 300000,
      priority: Number(env.ROUTER_PRIORITY) || 100,
      enabled: env.ROUTER_ENABLED !== "false",
    },
    {
      key: "api-router-1",
      name: "Gateway API Router",
      type: "API",
      provider: "generic",
      enabled: false,
      priority: 100,
      baseUrl: "http://192.168.1.1",
      loginApiUrl: "/dm/sys/?cmd=Login",
      connectedDevicesApiUrl:
        "/dm/tr98/?objs=WLANAssociatedDevice&page=StatusPage-CurrentWirelessUsers",
      healthPath: "/api/health",
      username: "admin",
      password: "admin",
      timeoutMs: 5000,
      retry: { attempts: 2, delayMs: 300 },
      loginStatusCodePath: "Login.status_code",
      loginStatusPath: "Login.data.login.status",
      loginSuccessStatus: "success",
      loginTokenPath: "Login.data.login.authenticatedToken",
      connectedDevicesDataPath: "WLANAssociatedDevice.data",
      deviceFieldMap: {
        mac: "associatedDeviceMACAddress",
        ip: "associatedDeviceIPAddress",
        hostname: "associatedDeviceHostName",
        manufacturer: "associatedDeviceManufacturer",
        band: "associatedDeviceStandard",
        rssi: "associatedDeviceRSSI",
        txRate: "associatedDeviceTxRate",
        rxRate: "associatedDeviceRecvRate",
        duration: "associatedDeviceDuration",
        expireTime: "associatedDeviceExpireTime",
        ssidIndex: "associatedDeviceSSIDIndex",
        iid: "iid",
      },
      tokenTtlMs: 300000,
    },
    {
      key: "scraper-router-1",
      name: "Legacy UI Router",
      type: "SCRAPER",
      provider: "generic",
      enabled: false,
      priority: 100,
      baseUrl: "http://192.168.1.1",
      loginPath: "/admin/login.asp",
      username: "admin",
      password: "password",
      headless: true,
      timeoutMs: 10000,
      retry: { attempts: 2, delayMs: 500 },
      selectors: {
        loggedIn: "#nav",
        username: 'input[name="username"]',
        password: 'input[name="password"]',
        submit: 'input[type="submit"]',
        statusLink: 'a:has-text("Status")',
        localDevicesLink: '#side a:has-text("Local Devices")',
        contentFrame: "#contentIframe",
        readyText: "text=LAN User List",
        rows: "table tbody tr",
      },
    },
  ];
}
