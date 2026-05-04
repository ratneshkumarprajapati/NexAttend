import prisma from "../../../services/prisma/prisma.client.js";



export class PresenceRepository {
    async createPresenceLog(params: {
        deviceId: number;
        apId?: number|undefined|null;
        rssi?: number|undefined;
        seenAt: Date|undefined;
    }) {
        const { deviceId, apId, rssi, seenAt } = params;

        return prisma.presenceLog.create({
            data: {
                deviceId,
                apId: apId ?? null,          
                rssi: rssi ?? null,          
                seenAt: seenAt ?? new Date()
            },
        });
    }
}