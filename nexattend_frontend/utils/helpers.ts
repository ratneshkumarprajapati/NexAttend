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
  publicId: string,
  date: Date,
  currentStatus: string,
): AttendanceStatus {
  const today = new Date();
  const isFuture = date > today;
  if (isFuture) return 'future';

  const seed = Array.from(`${publicId}:${date.toISOString()}`).reduce(
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
  publicId: string,
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
    const status = getAttendanceStatusForDay(publicId, date, currentStatus);
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

export function generateHourlyAttendanceData(present: number) {
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14]; // 6 AM - 2 PM
  return hours.map((hour) => ({
    time: hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`,
    hour,
    Present: Math.max(
      0,
      Math.round(
        present * (0.4 + (hour - 6) * 0.05 + Math.sin((hour - 6) / 2) * 0.05),
      ),
    ),
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
