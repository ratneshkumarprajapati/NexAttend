
import { createModuleLogger } from "../../utils/logger.js";
import { routerServices } from "./router.service.js";
import type { ConnectedDevice } from "./router.types.js";

const logger = createModuleLogger("Aggregator");

export class RouterAggregator {
  async fetchAllDevices(): Promise<ConnectedDevice[]> {
    logger.info("Fetching devices from all routers...");

    const results = await Promise.allSettled(
      routerServices.map(async (router, index) => {
        const start = Date.now();

        const devices = await router.fetchConnectedDevices();

        logger.info(`Router ${index} success`, {
          count: devices.length,
          latency: Date.now() - start,
        });

        return devices;
      })
    );

    const allDevices: ConnectedDevice[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allDevices.push(...result.value);
      } else {
        logger.error(`Router ${index} failed`, {
          error: result.reason?.message,
        });
      }
    });

    logger.info(`Total devices (before dedupe): ${allDevices.length}`);

    const uniqueDevices = this.deduplicate(allDevices);

    logger.info(`Unique devices (after dedupe): ${uniqueDevices.length}`);

    return uniqueDevices;
  }

  private deduplicate(devices: ConnectedDevice[]): ConnectedDevice[] {
    const map = new Map<string, ConnectedDevice>();

    for (const device of devices) {
      const mac = device.mac.toLowerCase();

      if (!map.has(mac)) {
        map.set(mac, device);
        continue;
      }

      const existing = map.get(mac)!;

      // choose stronger signal
      if (device.connection.rssi > existing.connection.rssi) {
        map.set(mac, device);
      }
    }

    return Array.from(map.values());
  }
}

export const routerAggregator = new RouterAggregator();
