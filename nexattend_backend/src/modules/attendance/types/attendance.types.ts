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

export interface StudentAttendanceCalendarQuery {
    year: number;
    month: number;
}

export type StudentAttendanceCalendarStatus = "present" | "absent" | "future";

export interface StudentAttendanceCalendarDay {
    date: string;
    status: StudentAttendanceCalendarStatus;
    firstSeen: string | null;
    lastSeen: string | null;
    totalDuration: number;
}
