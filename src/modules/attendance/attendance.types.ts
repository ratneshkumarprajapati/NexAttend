export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AttendanceSeenPayload {
    deviceId: number;
    userId: number;
    timestamp: Date;
}

export interface AttendanceDisconnectedPayload {
    deviceId: number;
    userId: number;
    timestamp: Date;
}
