import { attendanceMaintenanceJob } from "./attendance.job.js";
import { registerAttendanceSubscribers } from "./attendance.subscriber.js";


export const initAttendanceModule = () => {
  registerAttendanceSubscribers();
  attendanceMaintenanceJob.start();
};
