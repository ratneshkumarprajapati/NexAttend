import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';
import type { WeeklyDataPoint } from './dashboard-utils';

export function DashboardCharts({
  statusToday,
  weeklyData,
}: {
  statusToday: Array<{ name: string; value: number }>;
  weeklyData: WeeklyDataPoint[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="glass rounded-xl border border-border/50 p-6">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Status Today
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Distribution</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={statusToday} cx="50%" cy="50%" innerRadius={44} outerRadius={78} dataKey="value" paddingAngle={2}>
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl border border-border/50 p-6 lg:col-span-2">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weekly Trend
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Attendance overview</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis dataKey="name" stroke="currentColor" opacity={0.5} />
            <YAxis stroke="currentColor" opacity={0.5} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="present" fill="#22c55e" />
            <Bar dataKey="absent" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
