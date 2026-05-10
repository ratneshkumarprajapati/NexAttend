import { eventBus } from "../../events/eventBus.js";
import { accessPointService } from "../../modules/accesspoint/service/accesspoint.service.js";
import { createModuleLogger } from "../../utils/logger.js";
import type { ConnectedDevice } from "../../services/router/router.types.js";
import type { RouterSnapshotMessage } from "./routerSync.types.js";

const logger = createModuleLogger("RouterSnapshotProcessor");

export class RouterSnapshotProcessor {
  private previousDevices = new Map<string, ConnectedDevice>();

  async process(message: RouterSnapshotMessage): Promise<void> {
    const devices = message.snapshot.devices;
    logger.info(`Snapshot received: ${devices.length} devices`);

    if (message.snapshot.failures.length) {
      logger.warn("Router adapter reported partial failures", {
        failures: message.snapshot.failures,
      });
    }

    const currentMap = this.createCurrentDeviceMap(devices);
    await this.ensureAccessPoints(currentMap);
    await this.emitPresenceChanges(currentMap);
    this.previousDevices = currentMap;
  }

  private createCurrentDeviceMap(devices: ConnectedDevice[]) {
    const currentMap = new Map<string, ConnectedDevice>();

    for (const device of devices) {
      const mac = device.mac.toLowerCase();
      const existing = currentMap.get(mac);

      if (!existing || device.connection.rssi > existing.connection.rssi) {
        currentMap.set(mac, device);
      }
    }

    return currentMap;
  }

  private async ensureAccessPoints(currentMap: Map<string, ConnectedDevice>) {
    const accessPoints = new Map<string, ConnectedDevice["meta"]>();

    for (const device of currentMap.values()) {
      if (device.meta.ssidIndex != null) {
        accessPoints.set(
          `${device.meta.routerKey}:${device.meta.ssidIndex}`,
          device.meta,
        );
      }
    }

    for (const accessPoint of accessPoints.values()) {
      await accessPointService.ensureAccessPointForSsidIndex(
        accessPoint.ssidIndex,
        {
          routerKey: accessPoint.routerKey,
          routerName: accessPoint.routerName,
          routerProvider: accessPoint.routerProvider,
        },
      );
    }
  }

  private async emitPresenceChanges(currentMap: Map<string, ConnectedDevice>) {
    for (const [mac, device] of currentMap) {
      if (!this.previousDevices.has(mac)) {
        logger.info(`New Device: ${mac}`);
        await eventBus.emit("device:connected", {
          mac,
          ip: device.ip,
          rssi: device.connection.rssi,
          ssidIndex: device.meta.ssidIndex,
          routerKey: device.meta.routerKey,
          timestamp: new Date(),
        });
      }
    }

    for (const [mac] of this.previousDevices) {
      if (!currentMap.has(mac)) {
        logger.info(`Device Left: ${mac}`);
        await eventBus.emit("device:disconnected", {
          mac,
          timestamp: new Date(),
        });
      }
    }

    for (const [mac, device] of currentMap) {
      if (this.previousDevices.has(mac)) {
        await eventBus.emit("device:seen", {
          mac,
          ip: device.ip,
          rssi: device.connection.rssi,
          ssidIndex: device.meta.ssidIndex,
          routerKey: device.meta.routerKey,
          timestamp: new Date(),
        });
      }
    }
  }
}

export const routerSnapshotProcessor = new RouterSnapshotProcessor();
