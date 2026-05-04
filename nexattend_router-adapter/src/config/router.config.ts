import { z } from "zod";

/* ---------------- RETRY ---------------- */
const RetrySchema = z.object({
  attempts: z.number().int().positive().default(2),
  delayMs: z.number().int().nonnegative().default(300),
});

/* ---------------- BASE ---------------- */
const BaseRouterSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  provider: z.string().default("generic"),
  enabled: z.boolean().default(true),
  priority: z.number().int().default(100),
  timeoutMs: z.number().int().positive().default(5000),
  retry: RetrySchema.default({}),
});

/* ---------------- API ROUTER ---------------- */
const ApiRouterSchema = BaseRouterSchema.extend({
  type: z.literal("API"),

  baseUrl: z.string().url(),

  // 🔐 Auth
  username: z.string(),
  password: z.string(),

  // 🔥 REAL ROUTER SUPPORT
  loginApiUrl: z.string(),
  connectedDevicesApiUrl: z.string(),
  healthPath: z.string().optional(),

  // 🔥 RESPONSE PARSING (VERY IMPORTANT)
  loginStatusCodePath: z.string(),
  loginStatusPath: z.string(),
  loginSuccessStatus: z.string(),
  loginTokenPath: z.string(),

  connectedDevicesDataPath: z.string(),

  // 🔥 FIELD MAPPING (CORE FEATURE)
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

/* ---------------- SCRAPER ROUTER ---------------- */
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

/* ---------------- UNION ---------------- */
export const RouterConfigSchema = z.discriminatedUnion("type", [
  ApiRouterSchema,
  ScraperRouterSchema,
]);

/* ---------------- APP CONFIG ---------------- */
export const AppConfigSchema = z.object({
  port: z.number().int().positive().default(3000),
  logLevel: z.string().default("info"),
  pollIntervalMs: z.number().int().min(1000).default(3000),
  routers: z.array(RouterConfigSchema).default([]),
});

/* ---------------- TYPES ---------------- */
export type RouterConfig = z.infer<typeof RouterConfigSchema>;
export type ApiRouterConfig = z.infer<typeof ApiRouterSchema>;
export type ScraperRouterConfig = z.infer<typeof ScraperRouterSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

const Routers: RouterConfig[] = [
  {
    type: "API",
    key: process.env.ROUTER_KEY || "default",
    name: process.env.ROUTER_NAME || "Default Router",
    provider: process.env.ROUTER_PROVIDER || "generic",

    baseUrl: process.env.ROUTER_BASE_URL || "https://192.168.1.1",

    username: process.env.ROUTER_USERNAME || "admin",
    password: process.env.ROUTER_PASSWORD || "admin",

    loginApiUrl: "/dm/sys/?cmd=Login",
    connectedDevicesApiUrl:
      "/dm/tr98/?objs=WLANAssociatedDevice&page=StatusPage-CurrentWirelessUser",

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

    timeoutMs: 5000,
    retry: { attempts: 2, delayMs: 300 },
    tokenTtlMs: 300000,
    priority: 100,
    enabled: true,
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
      rows: "table tbody tr"
    }
  }
];

export function loadConfig(): AppConfig {
  const routersFromEnv = process.env.ROUTERS_JSON
    ? JSON.parse(process.env.ROUTERS_JSON)
    : Routers;

  return AppConfigSchema.parse({
    port: Number(process.env.PORT ?? 3000),
    logLevel: process.env.LOG_LEVEL ?? "info",
    pollIntervalMs: Number(process.env.ROUTER_POLL_INTERVAL_MS ?? 5000),
    routers: routersFromEnv
  });
}
