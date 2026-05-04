import { eventBus } from "../../../events/eventBus.js";
import { AttendanceProcessor } from "../processor/attendance.processor.js";
import { AttendanceRepository } from "../repository/attendance.repository.js";
import { AttendanceService } from "../service/attendance.service.js";


export const registerAttendanceSubscribers = () => {
  const repo = new AttendanceRepository();
  const service = new AttendanceService(repo);
  const processor = new AttendanceProcessor(service);

  eventBus.on("attendance:seen", (payload) => {
    void processor.handleSeen(payload);
  });

  eventBus.on("attendance:disconnected", (payload) => {
    void processor.handleDisconnected(payload);
  });
};
