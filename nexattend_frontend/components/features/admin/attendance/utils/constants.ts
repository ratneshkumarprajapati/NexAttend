export const ATTENDANCE_COLORS = {
  present: 'var(--status-present)',
  absent: 'var(--status-absent)',
  late: 'var(--status-late)',
  empty: 'var(--muted)',
} as const;

export const CHART_COLORS = {
  present: 'var(--chart-present)',
  absent: 'var(--chart-absent)',
  devices: 'var(--chart-devices)',
} as const;

export const STATUS_CLASSES = {
  present: 'border-status-present/30 bg-status-present/10 text-status-present-foreground dark:text-status-present',
  absent: 'border-status-absent/30 bg-status-absent/10 text-status-absent-foreground dark:text-status-absent',
  late: 'border-status-late/30 bg-status-late/15 text-status-late-foreground dark:text-status-late',
  empty: 'border-border/50 bg-muted/20 text-muted-foreground',
} as const;

export const LEGEND_CLASSES = {
  present: 'border-status-present/25 bg-status-present/10 text-status-present-foreground dark:text-status-present',
  absent: 'border-status-absent/25 bg-status-absent/10 text-status-absent-foreground dark:text-status-absent',
  late: 'border-status-late/25 bg-status-late/15 text-status-late-foreground dark:text-status-late',
} as const;

export const PAGE_SIZE = 10;
