export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AttendanceSeenPayload {
    deviceId: string;
    userId: string;
    timestamp: Date;
}

export interface AttendanceDisconnectedPayload {
    deviceId: string;
    userId: string;
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
