import dotenv from "dotenv";
import { NODE_ENVS } from "./constants.js";

dotenv.config();

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
    BASE_URL: process.env.ROUTER_BASE_URL!,
    USERNAME: process.env.ROUTER_USERNAME!,
    PASSWORD: process.env.ROUTER_PASSWORD!,
    POLL_INTERVAL: Number(process.env.ROUTER_POLL_INTERVAL) || 15000,
  },

  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET!,
    HASH_SALT: process.env.HASH_SALT!,
  },

  AI: {
    MIN_SESSION_DURATION: Number(process.env.MIN_SESSION_DURATION) || 120,
    MAX_INACTIVE_TIME: Number(process.env.MAX_INACTIVE_TIME) || 300,
    RSSI_THRESHOLD: Number(process.env.RSSI_THRESHOLD) || -80,
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
