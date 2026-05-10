'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_CLASSES } from '@/utils/constants';
import { formatMonthLabel } from '@/utils/helpers';
import { useGetStudentAttendanceCalendarQuery } from '@/redux/features/attendance';
import type { AttendanceCalendarDay, StudentAttendanceCalendarProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function StudentAttendanceCalendar({
  studentId,
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

  const {
    data: calendarData,
    isLoading,
    isFetching,
    error,
  } = useGetStudentAttendanceCalendarQuery({
    studentId,
    year: visibleMonth.getFullYear(),
    month: visibleMonth.getMonth() + 1,
  });
  const studentCalendar = useMemo(
    () => buildCalendarGrid(calendarData?.days ?? [], visibleMonth),
    [calendarData?.days, visibleMonth],
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
    <div className="space-y-3 ">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="p-2">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
                Present
              </p>
              <p className="text-xl font-bold text-foreground">
                {summary.present}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-2">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
                Absent
              </p>
              <p className="text-xl font-bold text-foreground">
                {summary.absent}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-2">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
                Late
              </p>
              <p className="text-xl font-bold text-foreground">
                {summary.late}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">{monthLabel}</CardTitle>
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
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1" />
              Present
            </Badge>
            <Badge variant="destructive" className="text-xs px-2 py-0.5 h-5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1" />
              Absent
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 border-amber-500/20 bg-amber-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
              Late
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error && (
            <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
              Failed to load live calendar data
            </div>
          )}
          <div className="grid grid-cols-7 gap-0.5 text-center text-xs font-medium text-muted-foreground mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <div key={idx} className="h-8 w-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          <div className="relative">
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/70">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            )}
            <div key={monthLabel} className="grid grid-cols-7 gap-0.5 animate-in fade-in-0 slide-in-from-right-1 duration-200">
              {studentCalendar.map((item, index) => (
                <CalendarDay key={index} item={item} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildCalendarGrid(
  days: Array<{ date: string; status: 'present' | 'absent' | 'future' }>,
  monthDate: Date,
): AttendanceCalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const statusByDate = new Map(days.map((day) => [day.date, day.status]));
  const items: AttendanceCalendarDay[] = [];

  for (let i = 0; i < firstOfMonth.getDay(); i += 1) {
    items.push({ date: null, status: 'empty' });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    items.push({
      date,
      status: statusByDate.get(key) ?? 'absent',
    });
  }

  while (items.length % 7 !== 0) {
    items.push({ date: null, status: 'empty' });
  }

  return items;
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
      className={`h-8 w-8 flex items-center justify-center rounded-md border text-xs font-medium transition-colors hover:scale-105 ${item.date
          ? `${getStatusClass(item.status)} cursor-pointer`
          : 'bg-muted/20 border-border/50'
        }`}
    >
      {item.date ? (
        <span className="text-foreground">
          {item.date.getDate()}
        </span>
      ) : null}
    </div>
  );
}
