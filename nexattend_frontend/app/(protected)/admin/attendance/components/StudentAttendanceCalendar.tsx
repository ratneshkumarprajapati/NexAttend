'use client';

import { useMemo } from 'react';
import { LEGEND_CLASSES, STATUS_CLASSES } from '../utils/constants';
import {
  generateStudentAttendanceCalendar,
  formatMonthLabel,
  type AttendanceCalendarDay,
} from '../utils/helpers';

interface StudentAttendanceCalendarProps {
  studentId: string;
  currentStatus: string;
}

export function StudentAttendanceCalendar({
  studentId,
  currentStatus,
}: StudentAttendanceCalendarProps) {
  const monthLabel = useMemo(() => formatMonthLabel(new Date()), []);

  const studentCalendar = useMemo(
    () => generateStudentAttendanceCalendar(studentId, currentStatus),
    [studentId, currentStatus],
  );

  const summary = useMemo(() => {
    return studentCalendar.reduce(
      (acc, item) => {
        if (item.status === 'present') acc.present += 1;
        if (item.status === 'absent') acc.absent += 1;
        if (item.status === 'late') acc.late += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0 },
    );
  }, [studentCalendar]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div
          className={`rounded-3xl border p-4 backdrop-blur-xl ${LEGEND_CLASSES.present}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Present Days
          </p>
          <p className="mt-2 text-2xl font-semibold">{summary.present}</p>
        </div>
        <div
          className={`rounded-3xl border p-4 backdrop-blur-xl ${LEGEND_CLASSES.absent}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Absent Days
          </p>
          <p className="mt-2 text-2xl font-semibold">{summary.absent}</p>
        </div>
        <div
          className={`rounded-3xl border p-4 backdrop-blur-xl ${LEGEND_CLASSES.late}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Late Days
          </p>
          <p className="mt-2 text-2xl font-semibold">{summary.late}</p>
        </div>
      </div>

      <div className={`rounded-3xl border p-4 backdrop-blur-xl ${LEGEND_CLASSES.present}`}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Attendance calendar for
            </p>
            <p className="text-lg font-semibold text-foreground">{monthLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 border-secondary/20 bg-secondary/10 text-secondary-foreground">
              <span className="h-2 w-2 rounded-full bg-secondary" /> Present
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 border-destructive/20 bg-destructive/10 text-destructive-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive" /> Absent
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 border-accent/20 bg-accent/10 text-accent-foreground">
              <span className="h-2 w-2 rounded-full bg-accent" /> Late
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[0.65rem] uppercase text-muted-foreground mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {studentCalendar.map((item, index) => (
            <CalendarDay key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarDay({ item }: { item: AttendanceCalendarDay }) {
  const getStatusClass = (status: string) => {
    return (
      STATUS_CLASSES[status as keyof typeof STATUS_CLASSES] ||
      STATUS_CLASSES.empty
    );
  };

  return (
    <div
      className={`min-h-10 rounded-2xl border p-1.5 text-center text-xs transition-colors duration-300 ${getStatusClass(item.status)}`}
    >
      {item.date ? (
        <>
          <span className="block font-semibold text-foreground">
            {item.date.getDate()}
          </span>
          <span className="block mt-1 text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
            {item.status === 'present'
              ? 'P'
              : item.status === 'late'
                ? 'L'
                : item.status === 'absent'
                  ? 'A'
                  : ''}
          </span>
        </>
      ) : (
        <span className="block h-full" />
      )}
    </div>
  );
}
