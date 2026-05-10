import { eventBus } from "../../../events/eventBus.js";
import { createModuleLogger } from "../../../utils/logger.js";
import type { AttendanceRepository } from "../repository/attendance.repository.js";
import type {
    AdminStudentAttendanceQuery,
    StudentAttendanceCalendarDay,
    StudentAttendanceCalendarQuery,
} from "../types/attendance.types.js";

const logger = createModuleLogger("AttendanceService");

const toDate = (value: Date | string | undefined) =>
    value instanceof Date ? value : value ? new Date(value) : new Date();

const startOfUtcDay = (value: Date) =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

const endOfUtcDay = (value: Date) =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 23, 59, 59, 999));

const isSameUtcDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();

const durationSeconds = (startTime: Date, endTime: Date) =>
    Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000));

const monitoringDate = (date?: string) =>
    date ? startOfUtcDay(new Date(`${date}T00:00:00.000Z`)) : startOfUtcDay(new Date());

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export class AttendanceService {
    constructor(private repo: AttendanceRepository) { }

    async handleSeen(userId: string, deviceId: string, timestampValue?: Date | string) {
        const timestamp = toDate(timestampValue);
        let activeSession = await this.repo.findActiveSession(userId, deviceId);

        if (activeSession && !isSameUtcDay(activeSession.startTime, timestamp)) {
            activeSession = await this.splitSessionAtDayBoundary(activeSession, timestamp);
        }

        if (!activeSession) {
            activeSession = await this.repo.createSession({
                userId,
                deviceId,
                startTime: timestamp,
                lastSeen: timestamp,
            });
        } else {
            activeSession = await this.repo.updateLastSeen(activeSession.id, timestamp);
        }

        await this.repo.createLog({
            sessionId: activeSession.id,
            userId,
            deviceId,
            timestamp,
            status: "PRESENT",
        });

        return activeSession;
    }

    async handleDisconnected(userId: string, deviceId: string, timestampValue?: Date | string) {
        const timestamp = toDate(timestampValue);
        const activeSession = await this.repo.findActiveSession(userId, deviceId);

        await this.repo.createLog({
            sessionId: activeSession?.id ?? null,
            userId,
            deviceId,
            timestamp,
            status: "ABSENT",
        });

        if (activeSession) {
            const closedSession = await this.closeSessionAt(activeSession, timestamp);
            eventBus.emit("attendance:completed", closedSession);
            logger.info(`Closed attendance session ${activeSession.id} on disconnect`);
        }

        return activeSession;
    }

    async closeStaleSessions(cutoff: Date) {
        const staleSessions = await this.repo.findStaleSessions(cutoff);

        for (const session of staleSessions) {
            await this.closeSessionAt(session, session.lastSeen);
        }

        if (staleSessions.length > 0) {
            logger.info(`Closed ${staleSessions.length} stale attendance sessions`);
        }

        return staleSessions.length;
    }

    async splitOpenSessionsAtDayBoundary(referenceTime = new Date()) {
        const todayStart = startOfUtcDay(referenceTime);
        const sessions = await this.repo.findActiveSessionsStartedBefore(todayStart);
        let splitCount = 0;

        for (const session of sessions) {
            await this.splitSessionAtDayBoundary(session, todayStart);
            splitCount += 1;
        }

        if (splitCount > 0) {
            logger.info(`Split ${splitCount} attendance sessions at day boundary`);
        }

        return splitCount;
    }

    async aggregateDaily() {
        return this.repo.upsertDailyFromSessions();
    }

    async getAggregationStats() {
        const [openSessions, closedSessions, dailyRows] = await Promise.all([
            this.repo.countOpenSessions(),
            this.repo.countClosedSessions(),
            this.repo.countDailyRows(),
        ]);

        return {
            openSessions,
            closedSessions,
            dailyRows,
        };
    }

    async getAdminStudentMonitor(query: AdminStudentAttendanceQuery) {
        const date = monitoringDate(query.date);
        const [totalStudents, presentStudents, activeDevices, filteredStudents, students] =
            await Promise.all([
                this.repo.countStudentsForMonitor(query),
                this.repo.countPresentStudentsForDate(query, date),
                this.repo.countActiveDevicesForMonitor(query),
                this.repo.countStudentsForMonitor(query, query.status, date),
                this.repo.findStudentMonitorRows(query, date),
            ]);
        const dailyAttendanceByUserId = await this.repo.findDailyAttendanceForUsers(
            students.map((student) => student.id),
            date,
        );

        return {
            date: date.toISOString().slice(0, 10),
            summary: {
                totalStudents,
                presentStudents,
                absentStudents: Math.max(0, totalStudents - presentStudents),
                activeDevices,
            },
            pagination: {
                page: query.page,
                limit: query.limit,
                total: filteredStudents,
                totalPages: Math.ceil(filteredStudents / query.limit),
            },
            students: students.map((student) => {
                const activeSession = student.sessions[0] ?? null;
                const dailyAttendance = dailyAttendanceByUserId.get(student.id) ?? student.attendanceDays[0] ?? null;

                return {
                    id: student.id,
                    email: student.email,
                    profile: student.profile,
                    devices: student.devices,
                    attendance: {
                        currentStatus: activeSession || dailyAttendance ? "PRESENT" : "ABSENT",
                        activeSession,
                        daily: dailyAttendance,
                    },
                    createdAt: student.createdAt,
                };
            }),
        };
    }

    async getStudentAttendanceCalendar(
        studentId: string,
        query: StudentAttendanceCalendarQuery,
    ): Promise<StudentAttendanceCalendarDay[]> {
        const startDate = new Date(Date.UTC(query.year, query.month - 1, 1));
        const endDate = new Date(Date.UTC(query.year, query.month, 1));
        const [dailyRows, logs] = await Promise.all([
            this.repo.findDailyAttendanceForUserInRange(
                studentId,
                startDate,
                endDate,
            ),
            this.repo.findAttendanceLogsForUserInRange(
                studentId,
                startDate,
                endDate,
            ),
        ]);

        const presentByDate = new Map<
            string,
            { firstSeen: Date; lastSeen: Date }
        >();

        for (const row of dailyRows) {
            if (!row.firstSeen) continue;

            presentByDate.set(dateKey(startOfUtcDay(row.date)), {
                firstSeen: row.firstSeen,
                lastSeen: row.lastSeen ?? row.firstSeen,
            });
        }

        for (const log of logs) {
            if (log.status !== "PRESENT") continue;

            const key = dateKey(startOfUtcDay(log.timestamp));
            const existing = presentByDate.get(key);

            if (!existing) {
                presentByDate.set(key, {
                    firstSeen: log.timestamp,
                    lastSeen: log.timestamp,
                });
                continue;
            }

            if (log.timestamp < existing.firstSeen) {
                existing.firstSeen = log.timestamp;
            }

            if (log.timestamp > existing.lastSeen) {
                existing.lastSeen = log.timestamp;
            }
        }

        const today = startOfUtcDay(new Date());
        const daysInMonth = new Date(Date.UTC(query.year, query.month, 0)).getUTCDate();
        const days: StudentAttendanceCalendarDay[] = [];

        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(Date.UTC(query.year, query.month - 1, day));
            const key = dateKey(date);
            const present = presentByDate.get(key);
            const isFuture = date > today;

            days.push({
                date: key,
                status: present ? "present" : isFuture ? "future" : "absent",
                firstSeen: present?.firstSeen.toISOString() ?? null,
                lastSeen: present?.lastSeen.toISOString() ?? null,
                totalDuration: present
                    ? Math.max(0, Math.floor((present.lastSeen.getTime() - present.firstSeen.getTime()) / 1000))
                    : 0,
            });
        }

        return days;
    }

    private async splitSessionAtDayBoundary(session: {
        id: string;
        userId: string;
        deviceId: string;
        startTime: Date;
        lastSeen: Date;
    }, nextSeen: Date) {
        const boundaryEnd = endOfUtcDay(session.startTime);
        await this.closeSessionAt(session, boundaryEnd);

        const nextStart = startOfUtcDay(nextSeen);
        return this.repo.createSession({
            userId: session.userId,
            deviceId: session.deviceId,
            startTime: nextStart,
            lastSeen: nextSeen,
        });
    }

    private async closeSessionAt(session: {
        id: string;
        startTime: Date;
    }, endTime: Date) {
        return this.repo.closeSession(
            session.id,
            endTime,
            durationSeconds(session.startTime, endTime),
        );
    }
}
