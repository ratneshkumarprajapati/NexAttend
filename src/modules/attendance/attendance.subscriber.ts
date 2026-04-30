import { eventBus } from "../../events/eventBus.js";
import { AttendanceProcessor } from "./attendance.processor.js";
import { AttendanceRepository } from "./attendance.repository.js";
import { AttendanceService } from "./attendance.service.js";


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
