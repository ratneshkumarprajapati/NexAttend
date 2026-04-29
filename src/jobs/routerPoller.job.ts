import { strictObject, string } from "zod";
import type { Device } from "./routerPoller.types.js";
import logger from "../utils/logger.js";
import { routerService } from "../services/router/router.service.js";




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
            this.timer = setTimeout(run, this.interval); // 🔥 loop
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
            //detect new device
            for (const [mac, device] of currentMap) {
                if (!this.previousDevices.has(mac)) {
                    logger.info(`New Device-> ${device.mac} `)
                }
            }
            //detected disconnected device

            for (const [mac, device] of this.previousDevices) {
                if (!currentMap.has(mac)) {
                    logger.info(`Left Device-> ${device.mac} `)
                }
            }

            // Detect EXISTING devices (optional)
            for (const [mac, device] of currentMap) {
                if (this.previousDevices.has(mac)) {
                    // you can track updates here (RSSI change etc)
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
export const poller = new RouterPoller(5000); 