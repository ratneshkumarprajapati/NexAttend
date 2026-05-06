'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { api } from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Smartphone, TrendingUp, Activity, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, change, trend, subtext }: any) {
  return (
    <div className="glass group rounded-xl p-6 hover:bg-white/10 dark:hover:bg-white/5 smooth-transition border border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs ${trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/20 p-3 text-primary group-hover:scale-110 smooth-transition">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; icon: any }> = {
    present: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
    absent: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    late: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
  };
  const config = configs[status] || configs.absent;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [activeDevices, setActiveDevices] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);

  type WeeklyDataPoint = {
    name: string;
    present: number;
    absent: number;
  };

  // Chart data
  const [statusToday, setStatusToday] = useState([
    { name: 'Present', value: 0 },
    { name: 'Absent', value: 0 },
  ]);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchDashboardData();
    }
  }, [mounted]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Fetch admin student monitor data (includes present/absent counts and students)
      const [studentsResponse, devicesResponse] = await Promise.all([
        api.get(`/attendance/admin/students?date=${today}&limit=1000`).catch((err) => ({ data: { data: [] } })),
        api.get(`/devices`).catch((err) => ({ data: { devices: [] } })),
      ]);

      const studentsData = studentsResponse.data?.data || [];
      const devicesData = devicesResponse.data?.devices || [];

      // Calculate stats from the admin student monitor endpoint
      if (studentsData && Array.isArray(studentsData)) {
        const presentCount = studentsData.filter((s: any) => s.attendanceStatus === 'PRESENT').length;
        const absentCount = studentsData.filter((s: any) => s.attendanceStatus === 'ABSENT').length;
        const totalCount = studentsData.length;

        setPresentToday(presentCount);
        setAbsentToday(absentCount);
        setTotalUsers(totalCount);

        // Calculate attendance rate
        const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        setAttendanceRate(rate);

        // Update status chart
        setStatusToday([
          { name: 'Present', value: presentCount },
          { name: 'Absent', value: absentCount },
        ]);

        // Extract recent records (last 5)
        const recentList = studentsData.slice(0, 5).map((student: any, idx: number) => ({
          id: idx,
          userId: student.publicId || `STU${idx + 1}`,
          name: student.firstName ? `${student.firstName} ${student.lastName}` : 'N/A',
          status: student.attendanceStatus || 'absent',
          deviceId: student.deviceUsed || 'N/A',
          time: student.checkInTime ? new Date(student.checkInTime).toLocaleTimeString() : 'N/A',
        }));
        setRecentRecords(recentList);
      }

      // Count active devices
      const activeCount = devicesData.filter((d: any) => d.status === 'active').length;
      setActiveDevices(activeCount);

      // Fetch user roles breakdown (total users)
      try {
        const usersResponse = await api.get(`/users`);
        const users = usersResponse.data?.data || [];
        const students = users.filter((u: any) => u.role === 'STUDENT').length;
        const admins = users.filter((u: any) => u.role === 'ADMIN').length;

        setStudentCount(students);
        setAdminCount(admins);
        setTotalUsers(users.length);
      } catch (err) {
        console.log('Could not fetch users, using attendance data counts');
      }

      // Generate weekly data (mock based on current pattern)
      const weekData = generateWeeklyData(presentToday, absentToday);
      setWeeklyData(weekData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyData = (present: number, absent: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((day, idx) => ({
      name: day,
      present: Math.max(0, present - Math.floor(Math.random() * 10)),
      absent: Math.max(0, absent + Math.floor(Math.random() * 3)),
    }));
  };

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-muted/30 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Welcome, {user?.name || 'User'}!</h1>
        <p className="text-muted-foreground mt-2">Real-time attendance monitoring and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} subtext={`${studentCount} students, ${adminCount} admins`} trend="up" />
        <StatCard icon={Users} label="Present Today" value={presentToday} change={Math.round((presentToday / (presentToday + absentToday || 1)) * 100)} trend="up" />
        <StatCard icon={Smartphone} label="Active Devices" value={activeDevices} trend="up" />
        <StatCard icon={TrendingUp} label="Attendance Rate" value={`${attendanceRate}%`} trend={attendanceRate >= 80 ? 'up' : 'down'} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Distribution */}
        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Status Today
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusToday} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                <Cell fill="#a78bfa" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="glass rounded-xl p-6 lg:col-span-2 border border-border/50">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Trend
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Attendance overview</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="name" stroke="currentColor" opacity={0.5} />
              <YAxis stroke="currentColor" opacity={0.5} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="present" fill="#a78bfa" />
              <Bar dataKey="absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Check-ins</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50">
              <tr className="text-muted-foreground">
                <th className="pb-3 text-left font-semibold">User Name</th>
                <th className="pb-3 text-left font-semibold">Time</th>
                <th className="pb-3 text-left font-semibold">Status</th>
                <th className="pb-3 text-left font-semibold">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : recentRecords.length > 0 ? (
                recentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 dark:hover:bg-white/5 smooth-transition">
                    <td className="py-3 text-foreground">{record.name}</td>
                    <td className="py-3 text-foreground">{record.time}</td>
                    <td className="py-3">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="py-3 text-muted-foreground">{record.deviceId}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-muted-foreground">No recent check-ins</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
