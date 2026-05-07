import type { AdminStudentMonitorResponse } from '@/lib/services/attendanceService';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'future' | 'empty';

export type AttendanceCalendarDay = {
  date: Date | null;
  status: AttendanceStatus;
};

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStudentName(
  student: NonNullable<AdminStudentMonitorResponse['students']>[number],
) {
  return (
    [student.profile?.firstName, student.profile?.lastName]
      .filter(Boolean)
      .join(' ') || student.email
  );
}

export function getAttendanceStatusForDay(
  id: string,
  date: Date,
  currentStatus: string,
): AttendanceStatus {
  const today = new Date();
  const isFuture = date > today;
  if (isFuture) return 'future';

  const seed = Array.from(`${id}:${date.toISOString()}`).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  const score = Math.abs(seed + date.getDate() * 31) % 100;
  const presentThreshold = currentStatus.toLowerCase() === 'absent' ? 55 : 75;

  if (score < presentThreshold) return 'present';
  if (score < presentThreshold + 15) return 'late';
  return 'absent';
}

export function generateStudentAttendanceCalendar(
  id: string,
  currentStatus: string,
  monthDate = new Date(),
): AttendanceCalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const items: AttendanceCalendarDay[] = [];
  for (let i = 0; i < firstOfMonth.getDay(); i += 1) {
    items.push({ date: null, status: 'empty' });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const status = getAttendanceStatusForDay(id, date, currentStatus);
    items.push({ date, status });
  }

  while (items.length % 7 !== 0) {
    items.push({ date: null, status: 'empty' });
  }

  return items;
}

export function formatMonthLabel(date: Date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function generateHourlyAttendanceData(
  students: NonNullable<AdminStudentMonitorResponse['students']> = [],
) {
  const hours = Array.from({ length: 24 }, (_, hour) => hour);

  return hours.map((hour) => ({
    time:
      hour === 0
        ? '12 AM'
        : hour < 12
          ? `${hour} AM`
          : hour === 12
            ? '12 PM'
            : `${hour - 12} PM`,
    hour,
    Present: students.filter((student) => {
      const firstSeen = student.attendance?.daily?.firstSeen;
      const lastSeen = student.attendance?.daily?.lastSeen;
      if (!firstSeen || !lastSeen) return false;

      const start = new Date(firstSeen);
      const end = new Date(lastSeen);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;

      return hour >= start.getHours() && hour <= end.getHours();
    }).length,
  }));
}

export function calculatePresenceDuration(
  arrivalTime: string | null | undefined,
  departureTime: string | null | undefined,
): string | null {
  if (!arrivalTime) return null;

  try {
    const arrival = new Date(arrivalTime);
    const departure = departureTime ? new Date(departureTime) : new Date();

    if (isNaN(arrival.getTime())) return null;

    const diffMs = Math.abs(departure.getTime() - arrival.getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0 && minutes === 0) return null;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch {
    return null;
  }
}
