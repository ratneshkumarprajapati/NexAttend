import type { AttendanceService } from "./attendance.service.js";



export class AttendanceProcessor {
    constructor(private service: AttendanceService) { }

    async handleSeen(payload: any) {
        await this.service.handleSeen(
            payload.userId,
            payload.deviceId,
            payload.timestamp
        );
    }

    async handleDisconnected(payload: any) {
        await this.service.handleDisconnected(
            payload.userId,
            payload.deviceId,
            payload.timestamp
        );
    }
}
