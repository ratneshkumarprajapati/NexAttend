'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { api } from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Smartphone, TrendingUp, Activity, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  const normalizedStatus = status.toLowerCase();
  const configs: Record<string, { bg: string; text: string; icon: any }> = {
    present: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
    absent: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    late: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
  };
  const config = configs[normalizedStatus] || configs.absent;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {normalizedStatus}
    </span>
  );
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

      // Get today's date in YYYY-MM-DD format using local time.
      const today = getLocalDateString();

      // Fetch admin student monitor data (includes present/absent counts and students)
      const [studentsResponse, devicesResponse] = await Promise.all([
        api.get(`/attendance/admin/students?date=${today}&limit=50`).catch(() => ({ data: { data: { students: [], summary: null } } })),
        api.get(`/devices`).catch(() => ({ data: { devices: [] } })),
      ]);

      const monitorData = studentsResponse.data?.data || {};
      const studentsData = Array.isArray(monitorData.students)
        ? monitorData.students
        : Array.isArray(monitorData)
          ? monitorData
          : [];
      const summary = monitorData.summary || {};
      const devicesData = devicesResponse.data?.devices || [];

      // Calculate stats from the admin student monitor endpoint
      if (Array.isArray(studentsData)) {
        const presentCount = summary.presentStudents ?? studentsData.filter((s: any) => s.attendance?.currentStatus === 'PRESENT').length;
        const absentCount = summary.absentStudents ?? studentsData.filter((s: any) => s.attendance?.currentStatus === 'ABSENT').length;
        const totalCount = summary.totalStudents ?? studentsData.length;

        setPresentToday(presentCount);
        setAbsentToday(absentCount);
        setTotalUsers(totalCount);
        setStudentCount(totalCount);

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
          id: student.publicId || idx,
          userId: student.publicId || `STU${idx + 1}`,
          name: [student.profile?.firstName, student.profile?.lastName].filter(Boolean).join(' ') || student.email || 'N/A',
          status: student.attendance?.currentStatus || 'ABSENT',
          deviceId: student.attendance?.activeSession?.device?.deviceName || student.devices?.[0]?.deviceName || 'N/A',
          time: student.attendance?.activeSession?.lastSeen
            ? new Date(student.attendance.activeSession.lastSeen).toLocaleTimeString()
            : 'N/A',
        }));
        setRecentRecords(recentList);

        // Generate weekly data (mock based on current pattern)
        setWeeklyData(generateWeeklyData(presentCount, absentCount));
      }

      // Count active devices
      const activeCount = summary.activeDevices ?? devicesData.filter((d: any) => d.status === 'active' || d.isActive).length;
      setActiveDevices(activeCount);

      // Fetch user roles breakdown (total users)
      try {
        const usersResponse = await api.get(`/users`);
        const usersPayload = usersResponse.data?.data;
        const users = Array.isArray(usersPayload)
          ? usersPayload
          : Array.isArray(usersPayload?.users)
            ? usersPayload.users
            : [];
        const students = users.filter((u: any) => u.role === 'STUDENT').length;
        const admins = users.filter((u: any) => u.role === 'ADMIN').length;

        if (users.length > 0) {
          setStudentCount(students);
          setAdminCount(admins);
          setTotalUsers(users.length);
        }
      } catch {
        console.log('Could not fetch users, using attendance data counts');
      }
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
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>User Name</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Device</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableCell colSpan={4} className="py-3 text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : recentRecords.length > 0 ? (
              recentRecords.map((record) => (
                <TableRow key={record.id} className="border-border/30 hover:bg-white/5">
                  <TableCell className="text-foreground">{record.name}</TableCell>
                  <TableCell className="text-foreground">{record.time}</TableCell>
                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.deviceId}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableCell colSpan={4} className="py-3 text-center text-muted-foreground">No recent check-ins</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
