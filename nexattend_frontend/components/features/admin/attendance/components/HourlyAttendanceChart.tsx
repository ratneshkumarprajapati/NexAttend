'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../utils/constants';

interface HourlyAttendanceChartProps {
  data: Array<{
    time: string;
    hour?: number;
    Present: number;
  }>;
}

export function HourlyAttendanceChart({ data }: HourlyAttendanceChartProps) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Selected Day Overview
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Hourly attendance pattern with AM/PM classification
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id="colorPresent"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={CHART_COLORS.present}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.present}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            opacity={0.1}
          />
          <XAxis
            dataKey="time"
            stroke="currentColor"
            opacity={0.5}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="currentColor"
            opacity={0.5}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--popover-foreground)',
            }}
            formatter={(value) => [value, 'Students Present']}
          />
          <Area
            type="monotone"
            dataKey="Present"
            stroke={CHART_COLORS.present}
            fill="url(#colorPresent)"
            strokeWidth={2}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
