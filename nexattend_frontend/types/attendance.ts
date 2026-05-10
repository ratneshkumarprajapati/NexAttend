import type { StudentAttendanceEntry } from '@/redux/features/attendance';
import type { LucideIcon } from 'lucide-react';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'future' | 'empty';

export type AttendanceCalendarDay = {
  date: Date | null;
  status: AttendanceStatus;
};

export type AttendanceRecord = {
  id: string;
  name: string;
  status: string;
  firstSeen: string;
  lastSeen: string;
  device: string;
  arrivalTime?: string;
  departureTime?: string;
};

export type AttendanceSummaryCard = {
  present: number;
  absent: number;
  late: number;
};

export type AttendanceStudent = StudentAttendanceEntry;

export type AttendanceRecordsTableProps = {
  records: AttendanceRecord[];
  loading?: boolean;
  onRowClick?: (record: AttendanceRecord) => void;
};

export type AttendanceStatsCardProps = {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'present' | 'absent' | 'late' | 'default';
};

export type HourlyAttendancePoint = {
  time: string;
  hour?: number;
  Present: number;
};

export type HourlyAttendanceChartProps = {
  data: HourlyAttendancePoint[];
};

export type StatusDistributionPoint = {
  name: string;
  value: number;
};

export type StatusDistributionChartProps = {
  data: StatusDistributionPoint[];
};

export type StudentAttendanceCalendarProps = {
  studentId: string;
  currentStatus: string;
};
