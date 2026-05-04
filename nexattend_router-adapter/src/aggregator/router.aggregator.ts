import type { ConnectedDevice, RouterAdapter, RouterHealth, RouterDiagnostics } from "../adapters/router.adapter.js";
import { dedupeByMac } from "../utils/device-normalizer.js";
import { logger } from "../utils/logger.js";

export interface AggregatedDevices {
  devices: ConnectedDevice[];
  failures: Array<{ routerKey: string; routerName: string; error: string }>;
  timestamp: string;
}

export class RouterAggregator {
  constructor(private readonly adapters: RouterAdapter[]) {}

  async fetchAllDevices(): Promise<AggregatedDevices> {
    const settled = await Promise.allSettled(
      this.adapters.map(async (adapter) => ({
        adapter,
        devices: await adapter.fetchConnectedDevices()
      }))
    );

    const devices: ConnectedDevice[] = [];
    const failures: AggregatedDevices["failures"] = [];

    settled.forEach((result, index) => {
      
      const adapter = this.adapters[index];
      if (result.status === "fulfilled") {
        devices.push(...result.value.devices);
      } else {
        const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
        failures.push({ routerKey: adapter.key, routerName: adapter.name, error });
        logger.warn("Router device fetch failed", { context: "Aggregator", routerKey: adapter.key, error });
      }
    });

    const uniqueDevices = dedupeByMac(devices);
    logger.info(`Unique devices (after dedupe): ${uniqueDevices.length}`, { context: "Aggregator" });

    return {
      devices: uniqueDevices,
      failures,
      timestamp: new Date().toISOString()
    };
  }

  async health(): Promise<RouterHealth[]> {
    const checks = await Promise.allSettled(
      this.adapters.map(async (adapter) => {
        const startedAt = performance.now();
        const available = await adapter.healthCheck();
        return {
          routerKey: adapter.key,
          routerName: adapter.name,
          routerType: adapter.type,
          available,
          latencyMs: Math.round(performance.now() - startedAt),
          checkedAt: new Date().toISOString()
        } satisfies RouterHealth;
      })
    );

    return checks.map((result, index) => {
      const adapter = this.adapters[index];
      if (result.status === "fulfilled") return result.value;

      return {
        routerKey: adapter.key,
        routerName: adapter.name,
        routerType: adapter.type,
        available: false,
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
        error: result.reason instanceof Error ? result.reason.message : String(result.reason)
      };
    });
  }

  async raw(routerKey: string): Promise<unknown> {
    const adapter = this.adapters.find((candidate) => candidate.key === routerKey);
    if (!adapter) {
      throw new Error(`Unknown routerKey: ${routerKey}`);
    }
    if (!adapter.fetchRawConnectedDevices) {
      throw new Error(`Router ${routerKey} does not expose raw data`);
    }

    return adapter.fetchRawConnectedDevices();
  }

  diagnostics(): RouterDiagnostics[] {
    return this.adapters.map((adapter) =>
      adapter.getDiagnostics
        ? adapter.getDiagnostics()
        : { key: adapter.key, name: adapter.name, type: adapter.type }
    );
  }
}
