'use client';

import { useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAppSelector } from '@/redux/store/hooks';
import { useGetAdminStudentMonitorQuery } from '@/redux/features/attendance';
import { useGetMyDevicesQuery } from '@/redux/features/device';
import { useGetAllUsersQuery } from '@/redux/features/user';
import { DashboardSkeleton } from '@/components/common/page-skeletons';
import {
  buildRecentCheckIns,
  buildWeeklyData,
  DashboardCharts,
  DashboardStatCard,
  getLocalDateString,
  RecentCheckInsTable,
  type DashboardStat,
} from '@/components/features/dashboard';
import { DASHBOARD_POLLING_INTERVAL } from '@/utils/constants';

const dashboardQueryOptions = {
  pollingInterval: DASHBOARD_POLLING_INTERVAL,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  skipPollingIfUnfocused: true,
} as const;

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const today = useMemo(() => getLocalDateString(), []);

  const {
    data: monitor,
    isLoading: isAttendanceLoading,
    error: attendanceError,
  } = useGetAdminStudentMonitorQuery({ date: today, limit: 50 }, dashboardQueryOptions);
  const {
    data: devices = [],
    isLoading: isDevicesLoading,
  } = useGetMyDevicesQuery(undefined, dashboardQueryOptions);
  const {
    data: users = [],
    isLoading: isUsersLoading,
  } = useGetAllUsersQuery(undefined, dashboardQueryOptions);

  const students = monitor?.students || [];
  const summary = monitor?.summary;
  const presentToday =
    summary?.presentStudents ??
    students.filter((student) => student.attendance?.currentStatus === 'PRESENT').length;
  const absentToday =
    summary?.absentStudents ??
    students.filter((student) => student.attendance?.currentStatus === 'ABSENT').length;
  const monitoredTotal = summary?.totalStudents ?? students.length;

  const studentCount = users.filter((item) => item.role === 'STUDENT').length || monitoredTotal;
  const adminCount = users.filter((item) => item.role === 'ADMIN').length;
  const totalUsers = users.length || monitoredTotal;
  const activeDevices =
    summary?.activeDevices ??
    devices.filter((device) => device.status === 'ACTIVE' || device.status === 'active').length;
  const attendanceRate = monitoredTotal > 0 ? Math.round((presentToday / monitoredTotal) * 100) : 0;

  const stats: DashboardStat[] = [
    {
      icon: Users,
      label: 'Total Users',
      value: totalUsers,
      subtext: `${studentCount} students, ${adminCount} admins`,
      trend: '100%',
    },
    {
      icon: CheckCircle2,
      label: 'Present Today',
      value: presentToday,
      subtext: `${absentToday} absent`,
      trend: `${attendanceRate}%`,
    },
    {
      icon: Smartphone,
      label: 'Active Devices',
      value: activeDevices,
      subtext: `${devices.length} registered devices`,
      trend: activeDevices > 0 ? '75%' : '8%',
    },
    {
      icon: TrendingUp,
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      subtext: attendanceRate >= 80 ? 'Healthy coverage' : 'Needs attention',
      trend: `${attendanceRate}%`,
    },
  ];

  const statusToday = [
    { name: 'Present', value: presentToday },
    { name: 'Absent', value: absentToday },
  ];
  const weeklyData = buildWeeklyData(presentToday, absentToday);
  const recentRecords = buildRecentCheckIns(students);
  const isInitialLoading = isAttendanceLoading || isDevicesLoading || isUsersLoading;

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Real-time attendance monitoring and insights
        </p>
      </div>

      {attendanceError && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>
              Attendance monitor data is unavailable right now. Other dashboard cards are still live.
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <DashboardCharts statusToday={statusToday} weeklyData={weeklyData} />
      <RecentCheckInsTable records={recentRecords} />
    </div>
  );
}
