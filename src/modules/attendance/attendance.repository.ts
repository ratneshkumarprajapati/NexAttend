import prisma from "../../services/prisma/prisma.client.js";




export class AttendanceRepository {
    async findActiveSession(userId: number, deviceId: number) {
        return prisma.attendanceSession.findFirst({
            where: {
                userId,
                deviceId,
                endTime: null
            }
        })

    }

    async createSession(data: {
        userId: number;
        deviceId: number;
        startTime: Date;
    }) {
        return prisma.attendanceSession.create({
            data: {
                userId: data.userId,
                deviceId: data.deviceId,
                startTime: data.startTime,
                endTime: null
            },
        });
    }

    async updateSession(sessionId: number, endTime: Date) {
        return prisma.$executeRaw`
            UPDATE "AttendanceSession"
            SET 
                "endTime" = ${endTime},
                "duration" = FLOOR(EXTRACT(EPOCH FROM (${endTime} - "startTime")))
            WHERE "id" = ${sessionId}
  `;
    }

    async updateLastSeen(sessionId: number, endTime: Date) {
        return prisma.attendanceSession.update({
            where: { id: sessionId },
            data: {
                endTime
            }
        })
    }

    async findStaleSessions(cutoff: Date) {
        return prisma.attendanceSession.findMany({
            where: {
                endTime: null,
                startTime: {
                    lt: cutoff,
                },
            },
        });
    }
}