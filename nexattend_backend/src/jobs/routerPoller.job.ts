import { env } from "../config/env.js";
import { eventBus } from "../events/eventBus.js";
import { accessPointService } from "../modules/accesspoint/service/accesspoint.service.js";
import { routerAggregator } from "../services/router/router.aggregator.js";
import { routerAdapterClient } from "../services/router/routerAdapter.client.js";
import { createModuleLogger } from "../utils/logger.js";
import type { Device } from "./routerPoller.types.js";

const logger = createModuleLogger("Poller");

export class RouterPoller {
    private interval: number;
    private timer: NodeJS.Timeout | null = null;

    private previousDevices = new Map<string, Device>();

    constructor(interval = 2000) {
        this.interval = interval;
    }

    start() {
        if (this.timer) return;

        logger.info("Started");

        const run = async () => {
            await this.poll();
            this.timer = setTimeout(run, this.interval);
        };

        run();
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            logger.info("Stopped");
        }
    }

    private async poll() {
        try {
            //  Fetch from aggregator
            const devices = await this.fetchDevices();

            logger.info(`Devices received: ${devices.length}`);

            //  Build current state map
            const currentMap = new Map<string, Device>();

            for (const d of devices) {
                const mac = d.mac.toLowerCase();
                const existing = currentMap.get(mac);

                if (!existing || d.connection.rssi > existing.connection.rssi) {
                    currentMap.set(mac, d);
                }
            }

            //  Ensure Access Points
            const accessPoints = new Map<string, Device["meta"]>();

            for (const device of currentMap.values()) {
                if (device.meta.ssidIndex != null) {
                    accessPoints.set(
                        `${device.meta.routerKey}:${device.meta.ssidIndex}`,
                        device.meta
                    );
                }
            }

            for (const ap of accessPoints.values()) {
                await accessPointService.ensureAccessPointForSsidIndex(
                    ap.ssidIndex,
                    {
                        routerKey: ap.routerKey,
                        routerName: ap.routerName,
                        routerProvider: ap.routerProvider,
                    }
                );
            }

            // Detect NEW devices
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

            //  Detect DISCONNECTED
            for (const [mac, device] of this.previousDevices) {
                if (!currentMap.has(mac)) {
                    logger.info(`Device Left: ${mac}`);

                    await eventBus.emit("device:disconnected", {
                        mac,
                        timestamp: new Date(),
                    });
                }
            }

            //  Detect EXISTING (heartbeat)
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

            //  Update state
            this.previousDevices = currentMap;

        } catch (error) {
            logger.error("Polling failed", error);
        }
    }

    private async fetchDevices() {
        if (env.ROUTER.EXECUTION_MODE === "router-adapter") {
            logger.info("Fetching devices from Router Adapter API");
            return routerAdapterClient.fetchConnectedDevices();
        }

        return routerAggregator.fetchAllDevices();
    }
}

//singleton instance
export const poller = new RouterPoller(env.ROUTER.POLL_INTERVAL);
