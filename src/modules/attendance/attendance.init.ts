import { registerAttendanceSubscribers } from "./attendance.subscriber.js";


export const initAttendanceModule = () => {
  registerAttendanceSubscribers();
};