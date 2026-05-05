import prisma from "../../../services/prisma/prisma.client.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type {
    AdminStudentAttendanceQuery,
    AdminStudentAttendanceStatus,
} from "../types/attendance.types.js";

export type AttendanceEventStatus = "PRESENT" | "ABSENT";

const buildStudentMonitorWhere = (
    query: Pick<AdminStudentAttendanceQuery, "department" | "search" | "year">,
    status: AdminStudentAttendanceStatus = "ALL",
): Prisma.UserWhereInput => {
    const where: Prisma.UserWhereInput = {
        role: "STUDENT",
        deletedAt: null,
    };

    const profileFilters: Prisma.ProfileWhereInput = {};

    if (query.department) {
        profileFilters.department = {
            equals: query.department,
            mode: "insensitive",
        };
    }

    if (query.year !== undefined) {
        profileFilters.year = query.year;
    }

    if (Object.keys(profileFilters).length > 0) {
        where.profile = {
            is: profileFilters,
        };
    }

    if (query.search) {
        where.OR = [
            {
                email: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                profile: {
                    is: {
                        firstName: {
                            contains: query.search,
                            mode: "insensitive",
                        },
                    },
                },
            },
            {
                profile: {
                    is: {
                        lastName: {
                            contains: query.search,
                            mode: "insensitive",
                        },
                    },
                },
            },
            {
                profile: {
                    is: {
                        enrolmentNo: {
                            contains: query.search,
                            mode: "insensitive",
                        },
                    },
                },
            },
        ];
    }

    if (status === "PRESENT") {
        where.sessions = {
            some: {
                endTime: null,
            },
        };
    }

    if (status === "ABSENT") {
        where.sessions = {
            none: {
                endTime: null,
            },
        };
    }

    return where;
};

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

    async countStudentsForMonitor(
        query: Pick<AdminStudentAttendanceQuery, "department" | "search" | "year">,
        status: AdminStudentAttendanceStatus = "ALL",
    ) {
        return prisma.user.count({
            where: buildStudentMonitorWhere(query, status),
        });
    }

    async countActiveDevicesForMonitor(
        query: Pick<AdminStudentAttendanceQuery, "department" | "search" | "year">,
    ) {
        return prisma.device.count({
            where: {
                deletedAt: null,
                isActive: true,
                user: buildStudentMonitorWhere(query),
            },
        });
    }

    async findStudentMonitorRows(
        query: AdminStudentAttendanceQuery,
        date: Date,
    ) {
        return prisma.user.findMany({
            where: buildStudentMonitorWhere(query, query.status),
            orderBy: {
                createdAt: "desc",
            },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            select: {
                publicId: true,
                email: true,
                createdAt: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phoneNo: true,
                        avatarUrl: true,
                        department: true,
                        enrolmentNo: true,
                        year: true,
                    },
                },
                devices: {
                    where: {
                        deletedAt: null,
                    },
                    select: {
                        publicId: true,
                        deviceName: true,
                        isActive: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                sessions: {
                    where: {
                        endTime: null,
                    },
                    orderBy: {
                        lastSeen: "desc",
                    },
                    take: 1,
                    select: {
                        publicId: true,
                        startTime: true,
                        lastSeen: true,
                        status: true,
                        confidenceScore: true,
                        device: {
                            select: {
                                publicId: true,
                                deviceName: true,
                            },
                        },
                        accessPoint: {
                            select: {
                                publicId: true,
                                name: true,
                                location: true,
                                routerName: true,
                            },
                        },
                    },
                },
                attendanceDays: {
                    where: {
                        date,
                    },
                    take: 1,
                    select: {
                        date: true,
                        totalDuration: true,
                        firstSeen: true,
                        lastSeen: true,
                    },
                },
            },
        });
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
