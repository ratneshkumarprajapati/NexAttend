import { z } from "zod";
import { loadEnv } from "./env.config.js";

loadEnv();

const QueueConfigSchema = z.object({
  enabled: z.boolean().default(true),
  url: z.string().default(""),
  exchange: z.string().default("nexattend.mobile-sync"),
  eventRoutingKey: z.string().default("mobile.device-event"),
  reconnectDelayMs: z.number().int().positive().default(5000),
});

export const AppConfigSchema = z.object({
  port: z.number().int().positive().default(5200),
  logLevel: z.string().default("info"),
  mobile: z.object({
    id: z.string().min(1).default("mobile-adapter"),
    name: z.string().min(1).default("Mobile Adapter"),
    aggregationWindowMs: z.number().int().nonnegative().default(1000),
  }),
  queue: QueueConfigSchema.default({}),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadConfig(): AppConfig {
  loadEnv();

  return AppConfigSchema.parse({
    port: Number(process.env.PORT ?? 5200),
    logLevel: process.env.LOG_LEVEL ?? "info",
    mobile: {
      id: process.env.MOBILE_ADAPTER_ID ?? "mobile-adapter",
      name: process.env.MOBILE_ADAPTER_NAME ?? "Mobile Adapter",
      aggregationWindowMs: Number(process.env.MOBILE_AGGREGATION_WINDOW_MS ?? 1000),
    },
    queue: {
      enabled: process.env.MOBILE_SYNC_PUBLISH_ENABLED !== "false",
      url: process.env.CLOUDAMQP_URL || process.env.AMQP_URL || "",
      exchange: process.env.MOBILE_SYNC_EXCHANGE || "nexattend.mobile-sync",
      eventRoutingKey:
        process.env.MOBILE_SYNC_EVENT_ROUTING_KEY || "mobile.device-event",
      reconnectDelayMs: Number(process.env.AMQP_RECONNECT_DELAY_MS ?? 5000),
    },
  });
}
