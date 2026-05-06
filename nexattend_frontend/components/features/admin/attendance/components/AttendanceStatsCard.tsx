'use client';

import { LucideIcon } from 'lucide-react';

interface AttendanceStatsCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'present' | 'absent' | 'late' | 'default';
}

const VARIANT_STYLES = {
  present: 'glass border-none text-foreground',
  absent: 'glass border-none text-foreground',
  late: 'glass border-none text-foreground',
  default: 'glass border-none text-foreground',
} as const;

export function AttendanceStatsCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: AttendanceStatsCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 backdrop-blur-xl transition-colors duration-300 ${VARIANT_STYLES[variant]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        {Icon && (
          <Icon className="h-8 w-8 opacity-40" />
        )}
      </div>
    </div>
  );
}
