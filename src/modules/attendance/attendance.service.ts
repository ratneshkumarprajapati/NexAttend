import type { AttendanceRepository } from "./attendance.repository.js";



export class AttendanceService {
    constructor(private repo: AttendanceRepository) { }

    async handleSeen(userId: number, deviceId: number, timestamp: Date) {
        const activeSession = await this.repo.findActiveSession(userId, deviceId);

        if (!activeSession) {
            //start session
            return this.repo.createSession({

                userId,
                deviceId,
                startTime: timestamp
            })
        };

        return activeSession;
    }

    async handleDisconnected(userId: number, deviceId: number, timestamp: Date) {
        const activeSession = await this.repo.findActiveSession(userId, deviceId);

        if (!activeSession) {
            return null;
        }

        return this.closeSession(activeSession, timestamp);
    }

    async closeSession(session: any, timestamp = new Date()) {
        const endTime = timestamp;

        // const duration = Math.floor(
        //     (endTime.getTime() - new Date(session.startTime).getTime()) / 1000
        // );
        return this.repo.updateSession(session.id, endTime)
    }
}
