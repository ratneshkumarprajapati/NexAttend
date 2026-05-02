import logger from "../../../utils/logger.js";
import { deviceService } from "../../device/service/device.service.js";
import type { PresenceRepository } from "../repository/presence.repository.js";



export class PresenceService {
    constructor(private repo: PresenceRepository) { };

    async identifyDevice(mac: string) {
        const normalizeMac = mac.toLowerCase();
        const device = await deviceService.identifyDevice(normalizeMac);

        if (!device) {
            logger.warn("Unknown Device:-", normalizeMac);
            return;
        }

        return device;
    }

    async processDeviceSence(mac: string, rssi?: number, timestamp?: Date) {
        const device = await this.identifyDevice(mac);

        if (!device) {
            return
        }
        const params = {
            deviceId: device.id,
            rssi:rssi,
            seenAt:timestamp,
        }

        await this.repo.createPresenceLog(params);

        return device;


    }

}
