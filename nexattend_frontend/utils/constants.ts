// Theme-aligned color palette (using CSS variables)
export const ATTENDANCE_COLORS = {
  // Status colors aligned to theme
  present: 'hsl(var(--secondary))',        // Secondary cyan/teal
  absent: 'hsl(var(--destructive))',       // Destructive red
  late: 'hsl(var(--accent))',              // Accent warm color
  empty: '#1e293b',                        // Slate for empty slots
} as const;

export const CHART_COLORS = {
  present: 'oklch(0.6 0.18 250)',         // Secondary cyan
  absent: 'oklch(0.65 0.28 25)',           // Destructive red
  devices: 'oklch(0.65 0.3 160)',          // Accent
} as const;

// CSS class mappings for consistency
export const STATUS_CLASSES = {
  present: 'bg-secondary/20 border-secondary/30 text-secondary-foreground',
  absent: 'bg-destructive/20 border-destructive/30 text-destructive-foreground',
  late: 'bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300',
  future: 'bg-muted/10 border-border/50 text-muted-foreground opacity-60',
  empty: 'bg-muted/10 border-border/50 text-muted-foreground',
} as const;

export const LEGEND_CLASSES = {
  present: 'border-secondary/20 bg-secondary/10 text-destructive-foreground',
  absent: 'border-destructive/20 bg-destructive/10 text-destructive-foreground',
  late: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
} as const;

export const PAGE_SIZE = 10;


//Redux
export const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const ACCESS_TOKEN_KEY = 'accessToken';

export const USER_KEY = 'user';

export const DASHBOARD_POLLING_INTERVAL = 60_000;
