import dotenv from "dotenv";
import { NODE_ENVS } from "./constants.js";

dotenv.config();

type RouterConfig = {
  key: string;
  name: string;
  provider: string;
  baseUrl: string;
  loginApiUrl: string;
  connectedDevicesApiUrl: string;
  loginStatusCodePath: string;
  loginStatusPath: string;
  loginSuccessStatus: string;
  loginTokenPath: string;
  connectedDevicesDataPath: string;
  deviceFieldMap: {
    mac: string;
    ip: string;
    hostname: string;
    manufacturer: string;
    band: string;
    rssi: string;
    txRate: string;
    rxRate: string;
    duration: string;
    expireTime: string;
    ssidIndex: string;
    iid: string;
  };
  username: string;
  password: string;
  priority: number;
  enabled: boolean;
};

const parseRouterConfigs = (): RouterConfig[] => {
  const defaultRouter: RouterConfig = {
    key: process.env.ROUTER_KEY || "default",
    name: process.env.ROUTER_NAME || "Default Router",
    provider: process.env.ROUTER_PROVIDER || "generic",
    baseUrl: process.env.ROUTER_BASE_URL || "https://192.168.1.1",
    loginApiUrl: process.env.ROUTER_LOGIN_API_URL || "/dm/sys/?cmd=Login",
    connectedDevicesApiUrl:
      process.env.ROUTER_CONNECTED_DEVICES_API_URL ||
      "/dm/tr98/?objs=WLANAssociatedDevice&page=StatusPage-CurrentWirelessUser",
    loginStatusCodePath:
      process.env.ROUTER_LOGIN_STATUS_CODE_PATH || "Login.status_code",
    loginStatusPath:
      process.env.ROUTER_LOGIN_STATUS_PATH || "Login.data.login.status",
    loginSuccessStatus: process.env.ROUTER_LOGIN_SUCCESS_STATUS || "success",
    loginTokenPath:
      process.env.ROUTER_LOGIN_TOKEN_PATH ||
      "Login.data.login.authenticatedToken",
    connectedDevicesDataPath:
      process.env.ROUTER_CONNECTED_DEVICES_DATA_PATH ||
      "WLANAssociatedDevice.data",
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
    username: process.env.ROUTER_USERNAME || "admin",
    password: process.env.ROUTER_PASSWORD || "admin",
    priority: Number(process.env.ROUTER_PRIORITY) || 100,
    enabled: process.env.ROUTER_ENABLED !== "false",
  };

  if (!process.env.ROUTER_CONFIGS_JSON) {
    return [defaultRouter];
  }

  try {
    const routers = JSON.parse(process.env.ROUTER_CONFIGS_JSON) as Partial<RouterConfig>[];

    const parsedRouters = routers
      .map((router, index) => ({
        ...defaultRouter,
        ...router,
        key: router.key || `router-${index + 1}`,
        name: router.name || router.key || `Router ${index + 1}`,
        provider: router.provider || defaultRouter.provider,
        deviceFieldMap: {
          ...defaultRouter.deviceFieldMap,
          ...router.deviceFieldMap,
        },
        priority: Number(router.priority ?? defaultRouter.priority),
        enabled: router.enabled !== false,
      }))
      .filter((router) => router.enabled);

    return parsedRouters.length > 0 ? parsedRouters : [defaultRouter];
  } catch {
    return [defaultRouter];
  }
};

const routers = parseRouterConfigs();
const primaryRouter = routers[0]!;

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,
  APP_NAME: process.env.APP_NAME || "NexAttend",

  DATABASE_URL: process.env.DATABASE_URL!,

  REDIS: {
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: Number(process.env.REDIS_PORT) || 6379,
    PASSWORD: process.env.REDIS_PASSWORD || "",
  },

  ROUTER: {
    EXECUTION_MODE:
      process.env.ROUTER_EXECUTION_MODE === "router-adapter"
        ? "router-adapter"
        : "normal",
    ADAPTER_BASE_URL:
      process.env.ROUTER_ADAPTER_BASE_URL || "http://localhost:5000",
    CONFIGS: routers,
    BASE_URL: primaryRouter.baseUrl,
    LOGIN_API_URL: primaryRouter.loginApiUrl,
    CONNECTED_DEVICES_API_URL: primaryRouter.connectedDevicesApiUrl,
    CONNECTED_DEVICES_DATA_PATH: primaryRouter.connectedDevicesDataPath,
    USERNAME: primaryRouter.username,
    PASSWORD: primaryRouter.password,
    POLL_INTERVAL: Number(process.env.ROUTER_POLL_INTERVAL) || 15000,
  },

  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET!,
    HASH_SALT: process.env.HASH_SALT!,
    HASH_SECRET: process.env.HASH_SECRET
  },

  AI: {
    MIN_SESSION_DURATION: Number(process.env.MIN_SESSION_DURATION) || 120,
    MAX_INACTIVE_TIME: Number(process.env.MAX_INACTIVE_TIME) || 300,
    RSSI_THRESHOLD: Number(process.env.RSSI_THRESHOLD) || -80,
  },

  LOG_DUMP: {
    ENABLED: process.env.LOG_DUMP_ENABLED !== "false",
    RUN_ON_STARTUP: process.env.LOG_DUMP_RUN_ON_STARTUP !== "false",
    CLEAN_AFTER_DUMP: process.env.LOG_DUMP_CLEAN_AFTER_DUMP !== "false",
    DIRECTORY: process.env.LOG_DUMP_DIRECTORY || "exports/log-dumps",
    HOUR: Number(process.env.LOG_DUMP_HOUR ?? 23),
    MINUTE: Number(process.env.LOG_DUMP_MINUTE ?? 0),
    BATCH_SIZE: Number(process.env.LOG_DUMP_BATCH_SIZE) || 5000,
  },

  SYSTEM_LOG: {
    ENABLED: process.env.SYSTEM_LOG_ENABLED !== "false",
    DIRECTORY: process.env.SYSTEM_LOG_DIRECTORY || "clogs",
    RETENTION_DAYS: Number(process.env.SYSTEM_LOG_RETENTION_DAYS) || 3,
  },

  OTEL: {
    ENABLED:
      process.env.OTEL_ENABLED === "true" ||
      (process.env.OTEL_ENABLED !== "false" &&
        (process.env.NODE_ENV || "development") !== NODE_ENVS.PRODUCTION),
    EXPORTER: process.env.OTEL_EXPORTER || "console",
    OTLP_TRACES_ENDPOINT:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      "http://localhost:4318/v1/traces",
    OTLP_METRICS_ENDPOINT:
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
      "http://localhost:4318/v1/metrics",
    METRICS_ENABLED: process.env.OTEL_METRICS_ENABLED === "true",
    METRIC_EXPORT_INTERVAL_MS:
      Number(process.env.OTEL_METRIC_EXPORT_INTERVAL_MS) || 15000,
  },

  WS_PORT: Number(process.env.WS_PORT) || 4000,
};
