import type { LucideIcon } from 'lucide-react';
import type { StudentAttendanceEntry } from '@/redux/features/attendance';

export type DashboardStat = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
};

export type WeeklyDataPoint = {
  name: string;
  present: number;
  absent: number;
};

export type RecentCheckIn = {
  id: string | number;
  name: string;
  status: string;
  deviceId: string;
  time: string;
};

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildWeeklyData(present: number, absent: number): WeeklyDataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return days.map((day, index) => ({
    name: day,
    present: Math.max(0, present - (4 - index) * 2),
    absent: Math.max(0, absent + (index % 2)),
  }));
}

export function buildRecentCheckIns(students: StudentAttendanceEntry[]): RecentCheckIn[] {
  return students.slice(0, 10).map((student, index) => ({
    id: student.id || index,
    name:
      [student.profile?.firstName, student.profile?.lastName].filter(Boolean).join(' ') ||
      student.email ||
      'N/A',
    status: student.attendance?.currentStatus || 'ABSENT',
    deviceId:
      student.attendance?.activeSession?.device?.deviceName ||
      student.devices?.[0]?.deviceName ||
      'N/A',
    time: student.attendance?.activeSession?.lastSeen
      ? new Date(student.attendance.activeSession.lastSeen).toLocaleTimeString()
      : 'N/A',
  }));
}
