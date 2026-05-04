import { attendanceMaintenanceJob } from "../job/attendance.job.js";
import { registerAttendanceSubscribers } from "../subscriber/attendance.subscriber.js";


export const initAttendanceModule = () => {
  registerAttendanceSubscribers();
  attendanceMaintenanceJob.start();
};
