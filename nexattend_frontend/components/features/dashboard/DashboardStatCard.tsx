import type { DashboardStat } from './dashboard-utils';

export function DashboardStatCard({ icon: Icon, label, value, trend, subtext }: DashboardStat) {
  return (
    <div className="glass group rounded-xl border border-border/50 p-6 smooth-transition hover:bg-white/10 dark:hover:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtext && <p className="mt-2 text-xs text-muted-foreground">{subtext}</p>}
        </div>
        <div className="rounded-lg bg-primary/20 p-3 text-primary smooth-transition group-hover:scale-105">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/40">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: trend }}
          />
        </div>
      )}
    </div>
  );
}
