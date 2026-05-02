import { eventBus } from "../../../events/eventBus.js";
import logger from "../../../utils/logger.js";
import type { PresenceService } from "../service/presence.service.js";



export class PresenceProcessor {
    constructor(private service: PresenceService) { }

    async handleDeviceConnected(payload: any) {
        const device = await this.service.processDeviceSence(
            payload.mac,
            payload.rssi,
            payload.timestamp


        )
        if (!device) {
            logger.error("no device present ",payload.mac);
            return
        };

        logger.info("Presence recorded:", payload.mac);
        // Emit attendance event
        eventBus.emit("attendance:seen", {
            userId: device.userId,
            deviceId: device.id,
            timestamp: payload.timestamp ?? new Date(),
        });

    }


    async handleDeviceDisconnected(payload: any) {
        logger.info("Device disconnected:", payload.mac);
        const device = await this.service.identifyDevice(payload.mac);

        if (!device) {
            logger.error("no device present ", payload.mac);
            return;
        }

        eventBus.emit("attendance:disconnected", {
            userId: device.userId,
            deviceId: device.id,
            timestamp: payload.timestamp ?? new Date(),
        });


    }
}
