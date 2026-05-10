import type { Request, Response } from "express";
import { sendSuccessResponse } from "../../../utils/apiResponse.js";
import { handleError } from "../../../utils/errorHandler.js";
import { AttendanceRepository } from "../repository/attendance.repository.js";
import { AttendanceService } from "../service/attendance.service.js";
import {
    adminStudentAttendanceQuerySchema,
    studentAttendanceCalendarParamsSchema,
    studentAttendanceCalendarQuerySchema,
} from "../validation/attendance.validation.js";

const attendanceService = new AttendanceService(new AttendanceRepository());

export const attendanceController = {
    async getAdminStudentMonitor(req: Request, res: Response) {
        try {
            const parsed = adminStudentAttendanceQuerySchema.parse(req.query);
            const monitor = await attendanceService.getAdminStudentMonitor(parsed);

            return sendSuccessResponse(
                res,
                200,
                "Student attendance monitor fetched successfully",
                monitor,
            );
        } catch (error) {
            return handleError(res, error);
        }
    },

    async getStudentAttendanceCalendar(req: Request, res: Response) {
        try {
            const params = studentAttendanceCalendarParamsSchema.parse(req.params);
            const query = studentAttendanceCalendarQuerySchema.parse(req.query);
            const calendar = await attendanceService.getStudentAttendanceCalendar(
                params.studentId,
                query,
            );

            return sendSuccessResponse(
                res,
                200,
                "Student attendance calendar fetched successfully",
                {
                    studentId: params.studentId,
                    year: query.year,
                    month: query.month,
                    days: calendar,
                },
            );
        } catch (error) {
            return handleError(res, error);
        }
    },
};
