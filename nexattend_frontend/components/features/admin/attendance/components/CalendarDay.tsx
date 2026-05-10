import { STATUS_CLASSES } from '@/utils/constants';
import type { AttendanceCalendarDay } from '@/types';

type CalendarDayProps = {
  item: AttendanceCalendarDay;
};

export function CalendarDay({ item }: CalendarDayProps) {
  const statusClass =
    STATUS_CLASSES[item.status as keyof typeof STATUS_CLASSES] ||
    STATUS_CLASSES.empty;

  return (
    <div
      className={`min-h-10 rounded-md border p-1.5 text-center text-xs transition-colors duration-300 ${statusClass}`}
    >
      {item.date ? (
        <>
          <span className="block font-semibold text-foreground">
            {item.date.getDate()}
          </span>
          <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
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
