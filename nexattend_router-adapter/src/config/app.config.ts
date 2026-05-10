import { z } from "zod";
import { loadEnv } from "./env.config.js";
import { createDefaultRouters, RouterConfigSchema } from "./router.config.js";

loadEnv();

const QueueConfigSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().default(""),
  exchange: z.string().default("nexattend.router-sync"),
  snapshotRoutingKey: z.string().default("router.snapshot"),
  reconnectDelayMs: z.number().int().positive().default(5000),
});

export const AppConfigSchema = z.object({
  port: z.number().int().positive().default(3000),
  logLevel: z.string().default("info"),
  pollIntervalMs: z.number().int().min(1000).default(3000),
  queue: QueueConfigSchema.default({}),
  routers: z.array(RouterConfigSchema).default([]),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadConfig(): AppConfig {
  loadEnv();

  const routers = process.env.ROUTERS_JSON
    ? JSON.parse(process.env.ROUTERS_JSON)
    : createDefaultRouters(process.env);

  return AppConfigSchema.parse({
    port: Number(process.env.PORT ?? 5000),
    logLevel: process.env.LOG_LEVEL ?? "info",
    pollIntervalMs: Number(process.env.ROUTER_POLL_INTERVAL_MS ?? 5000),
    queue: {
      enabled: process.env.ROUTER_SYNC_PUBLISH_ENABLED === "true",
      url: process.env.CLOUDAMQP_URL || process.env.AMQP_URL || "",
      exchange: process.env.ROUTER_SYNC_EXCHANGE || "nexattend.router-sync",
      snapshotRoutingKey:
        process.env.ROUTER_SYNC_SNAPSHOT_ROUTING_KEY || "router.snapshot",
      reconnectDelayMs: Number(process.env.AMQP_RECONNECT_DELAY_MS ?? 5000),
    },
    routers,
  });
}
