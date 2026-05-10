import prisma from "../../../services/prisma/prisma.client.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type {
    AdminStudentAttendanceQuery,
    AdminStudentAttendanceStatus,
} from "../types/attendance.types.js";

export type AttendanceEventStatus = "PRESENT" | "ABSENT";

export type DailyAttendanceSummary = {
    userId: string;
    date: Date;
    totalDuration: number;
    firstSeen: Date | null;
    lastSeen: Date | null;
};

const buildStudentMonitorWhere = (
    query: Pick<AdminStudentAttendanceQuery, "department" | "search" | "year">,
    status: AdminStudentAttendanceStatus = "ALL",
    date?: Date,
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

    if (status !== "ALL") {
        if (date) {
            const nextDate = new Date(date);
            nextDate.setUTCDate(nextDate.getUTCDate() + 1);
            where.attendanceLogs = {
                [status === "PRESENT" ? "some" : "none"]: {
                    timestamp: {
                        gte: date,
                        lt: nextDate,
                    },
                    status: "PRESENT",
                },
            };
        } else {
            where.sessions = {
                [status === "PRESENT" ? "some" : "none"]: {
                    endTime: null,
                },
            };
        }
    }

    return where;
};

export class AttendanceRepository {
    async findActiveSession(userId: string, deviceId: string) {
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
        userId: string;
        deviceId: string;
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

    async updateLastSeen(sessionId: string, lastSeen: Date) {
        return prisma.attendanceSession.update({
            where: { id: sessionId },
            data: { lastSeen },
        });
    }

    async closeSession(sessionId: string, endTime: Date, duration: number) {
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
        date?: Date,
    ) {
        return prisma.user.count({
            where: buildStudentMonitorWhere(query, status, date),
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
            where: buildStudentMonitorWhere(query, query.status, date),
            orderBy: {
                createdAt: "desc",
            },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            select: {
                id: true,
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
                        id: true,
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
                        id: true,
                        startTime: true,
                        lastSeen: true,
                        status: true,
                        confidenceScore: true,
                        device: {
                            select: {
                                id: true,
                                deviceName: true,
                            },
                        },
                        accessPoint: {
                            select: {
                                id: true,
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

    async countPresentStudentsForDate(
        query: Pick<AdminStudentAttendanceQuery, "department" | "search" | "year">,
        date: Date,
    ) {
        const nextDate = new Date(date);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);

        return prisma.user.count({
            where: {
                ...buildStudentMonitorWhere(query),
                attendanceLogs: {
                    some: {
                        timestamp: {
                            gte: date,
                            lt: nextDate,
                        },
                        status: "PRESENT",
                    },
                },
            },
        });
    }

    async findDailyAttendanceForUsers(userIds: string[], date: Date) {
        if (userIds.length === 0) {
            return new Map<string, DailyAttendanceSummary>();
        }

        const nextDate = new Date(date);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);

        const rows = await prisma.attendanceLog.groupBy({
            by: ["userId"],
            where: {
                userId: {
                    in: userIds,
                },
                timestamp: {
                    gte: date,
                    lt: nextDate,
                },
                status: "PRESENT",
            },
            _min: {
                timestamp: true,
            },
            _max: {
                timestamp: true,
            },
        });

        return new Map(
            rows.map((row) => {
                const firstSeen = row._min.timestamp;
                const lastSeen = row._max.timestamp;

                return [
                    row.userId,
                    {
                        userId: row.userId,
                        date,
                        firstSeen,
                        lastSeen,
                        totalDuration:
                            firstSeen && lastSeen
                                ? Math.max(0, Math.floor((lastSeen.getTime() - firstSeen.getTime()) / 1000))
                                : 0,
                    },
                ];
            }),
        );
    }

    async findAttendanceLogsForUserInRange(userId: string, startDate: Date, endDate: Date) {
        return prisma.attendanceLog.findMany({
            where: {
                userId,
                timestamp: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            select: {
                timestamp: true,
                status: true,
            },
            orderBy: {
                timestamp: "asc",
            },
        });
    }

    async findDailyAttendanceForUserInRange(userId: string, startDate: Date, endDate: Date) {
        return prisma.attendanceDaily.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            select: {
                date: true,
                totalDuration: true,
                firstSeen: true,
                lastSeen: true,
            },
            orderBy: {
                date: "asc",
            },
        });
    }
 
    async createLog(data: {
        sessionId?: string | null;
        userId: string;
        deviceId: string;
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
        const rows = await prisma.attendanceLog.groupBy({
            by: ["userId", "timestamp"],
            _min: {
                timestamp: true,
            },
            _max: {
                timestamp: true,
            },
        });

        const dailyRows = new Map<
            string,
            {
                userId: string;
                date: Date;
                totalDuration: number;
                firstSeen: Date;
                lastSeen: Date | null;
            }
        >();

        for (const row of rows) {
            const date = new Date(Date.UTC(
                row.timestamp.getUTCFullYear(),
                row.timestamp.getUTCMonth(),
                row.timestamp.getUTCDate(),
            ));
            const key = `${row.userId}:${date.toISOString()}`;
            const existing = dailyRows.get(key);
            const firstSeen = row._min.timestamp ?? row.timestamp;
            const lastSeen = row._max.timestamp ?? row.timestamp;
            const nextFirstSeen = existing
                ? existing.firstSeen < firstSeen ? existing.firstSeen : firstSeen
                : firstSeen;
            const nextLastSeen =
                existing?.lastSeen && lastSeen
                    ? existing.lastSeen > lastSeen ? existing.lastSeen : lastSeen
                    : existing?.lastSeen ?? lastSeen;

            dailyRows.set(key, {
                userId: row.userId,
                date,
                totalDuration: nextLastSeen
                    ? Math.max(0, Math.floor((nextLastSeen.getTime() - nextFirstSeen.getTime()) / 1000))
                    : 0,
                firstSeen: nextFirstSeen,
                lastSeen: nextLastSeen,
            });
        }

        const upserts = [...dailyRows.values()].map((row) =>
            prisma.attendanceDaily.upsert({
                where: {
                    userId_date: {
                        userId: row.userId,
                        date: row.date,
                    },
                },
                create: row,
                update: {
                    totalDuration: row.totalDuration,
                    firstSeen: row.firstSeen,
                    lastSeen: row.lastSeen,
                },
            }),
        );

        await prisma.$transaction(upserts);
        return upserts.length;
    }
}
