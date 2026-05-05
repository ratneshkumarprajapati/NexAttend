import { eventBus } from "../../../events/eventBus.js";
import { createModuleLogger } from "../../../utils/logger.js";
import type { PresenceService } from "../service/presence.service.js";

const logger = createModuleLogger("PresenceProcessor");


export class PresenceProcessor {
    constructor(private service: PresenceService) { }

    async handleDeviceConnected(payload: any) {
        const device = await this.service.processDeviceSence(
            payload.mac,
            payload.ssidIndex,
            payload.rssi,
            payload.timestamp,
            payload.routerKey


        )
        if (!device) {
            logger.error(`No device present: ${payload.mac}`);
            return
        };

        logger.info(`Presence recorded: ${payload.mac}`);
        // Emit attendance event
        eventBus.emit("attendance:seen", {
            userId: device.userId,
            deviceId: device.id,
            timestamp: payload.timestamp ?? new Date(),
        });

    }


    async handleDeviceDisconnected(payload: any) {
        logger.info(`Device disconnected: ${payload.mac}`);
        const device = await this.service.identifyDevice(payload.mac);

        if (!device) {
            logger.error(`No device present: ${payload.mac}`);
            return;
        }

        eventBus.emit("attendance:disconnected", {
            userId: device.userId,
            deviceId: device.id,
            timestamp: payload.timestamp ?? new Date(),
        });


    }
}
