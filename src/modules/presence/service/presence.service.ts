import logger from "../../../utils/logger.js";
import { resolveAccessPoint } from "../../accesspoint/ap.resolver.js";
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

    async processDeviceSence(mac: string,ssidIndex:number, rssi?: number, timestamp?: Date, routerKey?: string) {
        const device = await this.identifyDevice(mac);
        const apId = await resolveAccessPoint(ssidIndex, routerKey);

        if (!device) {
            return
        }
        const params = {
            deviceId: device.id,
            rssi:rssi,
            apId,
            seenAt:timestamp,
        }

        await this.repo.createPresenceLog(params);

        return device;


    }

}
