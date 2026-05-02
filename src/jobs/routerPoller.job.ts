import type { Device } from "./routerPoller.types.js";
import logger from "../utils/logger.js";
import { routerService } from "../services/router/router.service.js";
import { eventBus } from "../events/eventBus.js";
import { env } from "../config/env.js";
import { accessPointService } from "../modules/accesspoint/service/accesspoint.service.js";



export class RouterPoller {
    private interval: number;
    private timer: NodeJS.Timeout | null = null;

    //store previous state
    private previousDevices = new Map<string, Device>();

    constructor(interval = 1000) {
        this.interval = interval;
    }

    start() {
        if (this.timer) return;
        logger.info("Router Poller Started...");

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
        }
    }



    private async poll() {
        try {
            const device = await routerService.fetchConnectedDevices();
            const currentMap = new Map<string, Device>();
            //buld current map
            for (const d of device) {
                const mac = d.mac.toLowerCase();
                currentMap.set(mac, d)
            }

            const ssidIndexes = new Set<number>();
            for (const device of currentMap.values()) {
                if (device.meta.ssidIndex !== undefined && device.meta.ssidIndex !== null) {
                    ssidIndexes.add(Number(device.meta.ssidIndex));
                }
            }

            for (const ssidIndex of ssidIndexes) {
                await accessPointService.ensureAccessPointForSsidIndex(ssidIndex);
            }

            //detect new device
            for (const [mac, device] of currentMap) {
                if (!this.previousDevices.has(mac)) {
                    logger.info(`New Device-> ${device.mac} `)
                    await eventBus.emit('device:connected', {
                        mac,
                        ip: device.ip,
                        rssi: device.connection?.rssi,
                        ssidIndex: device.meta.ssidIndex,
                        timestamp: new Date(),
                    })
                }
            }
            //detected disconnected device

            for (const [mac, device] of this.previousDevices) {
                if (!currentMap.has(mac)) {
                    logger.info(`Left Device-> ${device.mac} `)
                    await eventBus.emit("device:disconnected", {
                        mac,
                        timestamp: new Date(),
                    });
                }
            }

            // Detect EXISTING devices (optional)
            for (const [mac, device] of currentMap) {
                if (this.previousDevices.has(mac)) {
                    await eventBus.emit("device:seen", {
                        mac,
                        ip: device.ip,
                        rssi: device.connection?.rssi,
                        ssidIndex: device.meta.ssidIndex,
                        timestamp: new Date(),
                    });
                }
            }

            // Update state
            this.previousDevices = currentMap;

        } catch (error) {
            logger.error("Polling failed:", error);
        }
    }
}

//single instance of poller
export const poller = new RouterPoller(env.ROUTER.POLL_INTERVAL); 
