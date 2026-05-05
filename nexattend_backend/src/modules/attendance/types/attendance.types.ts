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

export type AdminStudentAttendanceStatus = "ALL" | "PRESENT" | "ABSENT";

export interface AdminStudentAttendanceQuery {
    date?: string | undefined;
    department?: string | undefined;
    search?: string | undefined;
    year?: number | undefined;
    status: AdminStudentAttendanceStatus;
    page: number;
    limit: number;
}
