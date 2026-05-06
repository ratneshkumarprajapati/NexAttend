'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../utils/constants';

interface StatusDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  const colors = [
    CHART_COLORS.present,
    CHART_COLORS.absent,
    CHART_COLORS.devices,
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-foreground">
        Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--popover-foreground)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
