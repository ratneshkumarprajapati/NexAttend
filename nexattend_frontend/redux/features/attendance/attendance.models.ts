export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type AttendanceFilterStatus = 'ALL' | 'PRESENT' | 'ABSENT';

export interface AttendanceStudentProfile {
  firstName?:   string | null;
  lastName?:    string | null;
  phoneNo?:     string | null;
  avatarUrl?:   string | null;
  department?:  string | null;
  enrolmentNo?: string | null;
  year?:        number | null;
}

export interface AttendanceDeviceSnapshot {
  id:          string;
  deviceName?: string | null;
  isActive?:   boolean;
  createdAt?:  string;
}

export interface DailyAttendanceSummary {
  date?:          string;
  totalDuration?: number;
  firstSeen?:     string | null;
  lastSeen?:      string | null;
}

export interface SessionDevice {
  id?:         string;
  deviceName?: string | null;
}

export interface ActiveAttendanceSession {
  id?:        string;
  startTime?: string;
  lastSeen?:  string;
  status?:    string;
  device?:    SessionDevice | null;
}

export interface StudentAttendanceInfo {
  currentStatus?: AttendanceStatus | string;
  daily?:         DailyAttendanceSummary | null;
  activeSession?: ActiveAttendanceSession | null;
}

export interface AttendanceMonitorFilters {
  date?:       string;
  status?:     AttendanceFilterStatus;
  page?:       number;
  limit?:      number;
  department?: string;
  year?:       number;
  search?:     string;
}

export interface AttendanceSummary {
  totalStudents:   number;
  presentStudents: number;
  absentStudents:  number;
  activeDevices:   number;
}

export interface AttendancePagination {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export interface StudentAttendanceEntry {
  id:          string;
  email:       string;
  profile?:    AttendanceStudentProfile | null;
  devices?:    AttendanceDeviceSnapshot[];
  attendance?: StudentAttendanceInfo | null;
  createdAt?:  string;
}

export interface AdminStudentMonitorResponse {
  date?:          string;
  summary?:       AttendanceSummary;
  pagination?:    AttendancePagination;
  students?:      StudentAttendanceEntry[];
  total?:         number;
  presentCount?:  number;
  absentCount?:   number;
  activeDevices?: number;
}

export interface StudentAttendanceCalendarQuery {
  studentId: string;
  year:      number;
  month:     number;
}

export type StudentAttendanceCalendarStatus = 'present' | 'absent' | 'future';

export interface StudentAttendanceCalendarDayResponse {
  date:          string;
  status:        StudentAttendanceCalendarStatus;
  firstSeen:     string | null;
  lastSeen:      string | null;
  totalDuration: number;
}

export interface StudentAttendanceCalendarResponse {
  studentId: string;
  year:      number;
  month:     number;
  days:      StudentAttendanceCalendarDayResponse[];
}

export interface SelectedMonth {
  year:  number;
  month: number;
}

export interface AttendanceState {
  filters:       AttendanceMonitorFilters;
  selectedMonth: SelectedMonth;
}
