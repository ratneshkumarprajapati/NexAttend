import prisma from "../../../services/prisma/prisma.client.js";

export type AttendanceEventStatus = "PRESENT" | "ABSENT";

export class AttendanceRepository {
    async findActiveSession(userId: number, deviceId: number) {
        return prisma.attendanceSession.findFirst({
            where: {
                userId,
                deviceId,
                endTime: null,
            },
            orderBy: {
                startTime: "desc",
            },
        });
    }

    async createSession(data: {
        userId: number;
        deviceId: number;
        startTime: Date;
        lastSeen?: Date;
    }) {
        return prisma.attendanceSession.create({
            data: {
                userId: data.userId,
                deviceId: data.deviceId,
                startTime: data.startTime,
                lastSeen: data.lastSeen ?? data.startTime,
                duration: 0,
                endTime: null,
            },
        });
    }

    async updateLastSeen(sessionId: number, lastSeen: Date) {
        return prisma.attendanceSession.update({
            where: { id: sessionId },
            data: { lastSeen },
        });
    }

    async closeSession(sessionId: number, endTime: Date, duration: number) {
        return prisma.attendanceSession.update({
            where: { id: sessionId },
            data: {
                endTime,
                lastSeen: endTime,
                duration,
            },
        });
    }

    async countOpenSessions() {
        return prisma.attendanceSession.count({
            where: {
                endTime: null,
            },
        });
    }

    async countClosedSessions() {
        return prisma.attendanceSession.count({
            where: {
                endTime: {
                    not: null,
                },
            },
        });
    }

    async countDailyRows() {
        return prisma.attendanceDaily.count();
    }

    async createLog(data: {
        sessionId?: number | null;
        userId: number;
        deviceId: number;
        timestamp: Date;
        status: AttendanceEventStatus;
    }) {
        return prisma.attendanceLog.create({
            data: {
                sessionId: data.sessionId ?? null,
                userId: data.userId,
                deviceId: data.deviceId,
                timestamp: data.timestamp,
                status: data.status,
            },
        });
    }

    async findStaleSessions(cutoff: Date) {
        return prisma.attendanceSession.findMany({
            where: {
                endTime: null,
                lastSeen: {
                    lt: cutoff,
                },
            },
        });
    }

    async findActiveSessionsStartedBefore(cutoff: Date) {
        return prisma.attendanceSession.findMany({
            where: {
                endTime: null,
                startTime: {
                    lt: cutoff,
                },
            },
        });
    }

    async upsertDailyFromSessions() {
        return prisma.$executeRaw`
            INSERT INTO "AttendanceDaily" (
                "publicId",
                "userId",
                "date",
                "totalDuration",
                "firstSeen",
                "lastSeen",
                "updatedAt"
            )
            SELECT
                CONCAT('day_', md5(CONCAT("userId"::text, ':', date_trunc('day', "startTime")::date::text))),
                "userId",
                date_trunc('day', "startTime")::date,
                COALESCE(SUM("duration"), 0)::integer,
                MIN("startTime"),
                MAX("endTime"),
                NOW()
            FROM "AttendanceSession"
            WHERE "endTime" IS NOT NULL
            GROUP BY "userId", date_trunc('day', "startTime")::date
            ON CONFLICT ("userId", "date") DO UPDATE SET
                "totalDuration" = EXCLUDED."totalDuration",
                "firstSeen" = EXCLUDED."firstSeen",
                "lastSeen" = EXCLUDED."lastSeen",
                "updatedAt" = NOW()
        `;
    }
}
