import { Router } from "express";
import { adminMiddleware, authMiddleware } from "../../auth/middleware/auth.middleware.js";
import { attendanceController } from "../controller/attendance.controller.js";

const router = Router();

router.get(
    "/admin/students",
    authMiddleware,
    adminMiddleware,
    attendanceController.getAdminStudentMonitor,
);

router.get(
    "/admin/students/:studentId/calendar",
    authMiddleware,
    adminMiddleware,
    attendanceController.getStudentAttendanceCalendar,
);

export default router;
