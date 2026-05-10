'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { LEGEND_CLASSES } from '@/utils/constants';
import { CalendarDay } from './CalendarDay';
import {
  generateStudentAttendanceCalendar,
  formatMonthLabel,
} from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import type { StudentAttendanceCalendarProps } from '@/types';

export function StudentAttendanceCalendar({
  studentId,
  currentStatus,
}: StudentAttendanceCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  const monthLabel = useMemo(() => formatMonthLabel(visibleMonth), [visibleMonth]);
  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return (
      visibleMonth.getFullYear() === today.getFullYear() &&
      visibleMonth.getMonth() === today.getMonth()
    );
  }, [visibleMonth]);

  const studentCalendar = useMemo(
    () => generateStudentAttendanceCalendar(studentId, currentStatus, visibleMonth),
    [studentId, currentStatus, visibleMonth],
  );

  const moveMonth = (step: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));
  };

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
          className={`rounded-lg border p-4 backdrop-blur-xl ${LEGEND_CLASSES.present}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Present Days
          </p>
          <p className="mt-2 text-2xl font-semibold">{summary.present}</p>
        </div>
        <div
          className={`rounded-lg border p-4 backdrop-blur-xl ${LEGEND_CLASSES.absent}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Absent Days
          </p>
          <p className="mt-2 text-2xl font-semibold">{summary.absent}</p>
        </div>
        <div
          className={`rounded-lg border p-4 backdrop-blur-xl ${LEGEND_CLASSES.late}`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Late Days
          </p>
          <p className="mt-2 text-2xl font-semibold">{summary.late}</p>
        </div>
      </div>

      <div className={`rounded-lg border p-4 backdrop-blur-xl ${LEGEND_CLASSES.present}`}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Attendance calendar for
            </p>
            <p className="text-lg font-semibold text-foreground">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setVisibleMonth(new Date())} disabled={isCurrentMonth} aria-label="Current month">
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveMonth(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
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

        <div key={monthLabel} className="grid grid-cols-7 gap-1 animate-in fade-in-0 slide-in-from-right-1 duration-200">
          {studentCalendar.map((item, index) => (
            <CalendarDay key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
