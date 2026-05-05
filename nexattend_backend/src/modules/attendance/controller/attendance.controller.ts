import type { Request, Response } from "express";
import { sendSuccessResponse } from "../../../utils/apiResponse.js";
import { handleError } from "../../../utils/errorHandler.js";
import { AttendanceRepository } from "../repository/attendance.repository.js";
import { AttendanceService } from "../service/attendance.service.js";
import { adminStudentAttendanceQuerySchema } from "../validation/attendance.validation.js";

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
};
