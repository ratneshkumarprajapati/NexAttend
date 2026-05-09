export interface AttendanceStudentRecord {
  id: string;
  email?: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    department?: string | null;
    enrolmentNo?: string | null;
    year?: number | null;
  } | null;
  devices?: Array<{
    id?: string;
    deviceName?: string | null;
    isActive?: boolean;
    createdAt?: string;
  }>;
  attendance?: {
    currentStatus?: string;
    daily?: {
      date?: string;
      totalDuration?: number;
      firstSeen?: string | null;
      lastSeen?: string | null;
    } | null;
    activeSession?: {
      id?: string;
      startTime?: string;
      lastSeen?: string;
      status?: string;
      device?: {
        id?: string;
        deviceName?: string | null;
      } | null;
    } | null;
  } | null;
}

export interface AdminStudentMonitorResponse {
  date?: string;
  summary?: {
    totalStudents?: number;
    presentStudents?: number;
    absentStudents?: number;
    activeDevices?: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  students?: AttendanceStudentRecord[];
}
