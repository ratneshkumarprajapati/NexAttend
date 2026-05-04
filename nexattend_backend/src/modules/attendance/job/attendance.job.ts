import { env } from "../../../config/env.js";
import logger from "../../../utils/logger.js";
import { AttendanceRepository } from "../repository/attendance.repository.js";
import { AttendanceService } from "../service/attendance.service.js";

class AttendanceMaintenanceJob {
    private timer: NodeJS.Timeout | null = null;
    private isRunning = false;

    constructor(
        private service: AttendanceService,
        private intervalMs = 60_000,
        private staleAfterSeconds = env.AI.MAX_INACTIVE_TIME,
    ) { }

    start() {
        if (this.timer) return;

        logger.info("Attendance maintenance job started");

        const run = async () => {
            await this.runOnce();
            this.timer = setTimeout(run, this.intervalMs);
        };

        void run();
    }

    stop() {
        if (!this.timer) return;

        clearTimeout(this.timer);
        this.timer = null;
    }

    async runOnce() {
        if (this.isRunning) {
            logger.debug("Attendance maintenance job skipped because previous run is still active");
            return;
        }
        this.isRunning = true;

        try {
            const now = new Date();
            const cutoff = new Date(now.getTime() - this.staleAfterSeconds * 1000);

            const before = await this.service.getAggregationStats();
            const splitCount = await this.service.splitOpenSessionsAtDayBoundary(now);
            const closedCount = await this.service.closeStaleSessions(cutoff);
            const affectedDailyRows = await this.service.aggregateDaily();
            const after = await this.service.getAggregationStats();

            logger.info(
                `Attendance maintenance run: open=${before.openSessions}->${after.openSessions}, ` +
                `closed=${before.closedSessions}->${after.closedSessions}, ` +
                `dailyRows=${before.dailyRows}->${after.dailyRows}, ` +
                `split=${splitCount}, staleClosed=${closedCount}, aggregateAffected=${affectedDailyRows}`,
            );
        } catch (error) {
            logger.error("Attendance maintenance job failed", error);
        } finally {
            this.isRunning = false;
        }
    }
}

const attendanceJobService = new AttendanceService(new AttendanceRepository());
export const attendanceMaintenanceJob = new AttendanceMaintenanceJob(attendanceJobService);
