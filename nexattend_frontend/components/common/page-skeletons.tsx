import { Skeleton } from '@/components/ui/skeleton';

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-slate-200/60 bg-slate-50/40 p-6 dark:border-slate-800/70 dark:bg-slate-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200/60 bg-slate-50/40 p-6 dark:border-slate-800/70 dark:bg-slate-950/20">
        <Skeleton className="mb-6 h-5 w-36" />
        <div className="mx-auto h-32 w-32 animate-spin rounded-full border-8 border-slate-200/80 border-t-slate-400/80 dark:border-slate-800/80 dark:border-t-slate-500/80" />
      </div>
      <div className="rounded-xl border border-slate-200/60 bg-slate-50/40 p-6 dark:border-slate-800/70 dark:bg-slate-950/20 lg:col-span-2">
        <Skeleton className="mb-6 h-5 w-40" />
        <div className="flex h-56 items-end gap-3">
          {[42, 68, 56, 82, 64].map((height) => (
            <Skeleton
              key={height}
              className="flex-1 rounded-t-lg"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  columns = 4,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton key={columnIndex} className="h-9 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      <ChartGridSkeleton />
      <div className="rounded-xl border border-slate-200/60 bg-slate-50/40 p-6 dark:border-slate-800/70 dark:bg-slate-950/20">
        <Skeleton className="mb-6 h-5 w-40" />
        <TableSkeleton columns={4} rows={5} />
      </div>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-border/50 bg-sidebar p-6 lg:block">
        <Skeleton className="mb-8 h-10 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </aside>
      <main className="pt-16 pb-8 lg:ml-64">
        <div className="space-y-8 px-4 sm:px-6 lg:px-8">
          <PageHeaderSkeleton />
          <StatCardsSkeleton />
        </div>
      </main>
    </div>
  );
}
