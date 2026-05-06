'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download } from 'lucide-react';
import { ListPagination } from '@/components/list-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { attendanceService, type AdminStudentMonitorResponse } from '@/lib/services/attendanceService';

const COLORS = ['#0f766e', '#dc2626', '#f59e0b'];
const PAGE_SIZE = 10;

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStudentName(student: NonNullable<AdminStudentMonitorResponse['students']>[number]) {
  return [student.profile?.firstName, student.profile?.lastName].filter(Boolean).join(' ') || student.email;
}

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [monitor, setMonitor] = useState<AdminStudentMonitorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getAdminStudentMonitor({
        date: selectedDate,
        limit: 100,
      });
      setMonitor(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const summary = monitor?.summary;
  const students = monitor?.students || [];

  const dailyData = [
    {
      name: selectedDate,
      present: summary?.presentStudents || 0,
      absent: summary?.absentStudents || 0,
      activeDevices: summary?.activeDevices || 0,
    },
  ];

  const statusData = [
    { name: 'Present', value: summary?.presentStudents || 0, fill: COLORS[0] },
    { name: 'Absent', value: summary?.absentStudents || 0, fill: COLORS[1] },
    { name: 'Active Devices', value: summary?.activeDevices || 0, fill: COLORS[2] },
  ];

  const attendanceRecords = students.map((student) => ({
    id: student.publicId,
    name: getStudentName(student),
    status: student.attendance?.currentStatus?.toLowerCase() || 'absent',
    time: student.attendance?.activeSession?.lastSeen
      ? new Date(student.attendance.activeSession.lastSeen).toLocaleTimeString()
      : '-',
    device: student.attendance?.activeSession?.device?.deviceName || student.devices?.[0]?.deviceName || '-',
  }));
  const totalPages = Math.max(1, Math.ceil(attendanceRecords.length / PAGE_SIZE));
  const paginatedRecords = attendanceRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleExport = () => {
    if (attendanceRecords.length === 0) return;

    const csv = [
      'name,status,time,device',
      ...attendanceRecords.map((record) => [record.name, record.status, record.time, record.device].join(',')),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', `attendance-${selectedDate}.csv`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Monitoring</h1>
        <p className="text-muted-foreground mt-1">Live attendance records from the admin monitor API</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/5"
          />
        </div>
        <Button onClick={handleExport} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 ml-auto" disabled={attendanceRecords.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Selected Day Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="present" fill={COLORS[0]} />
              <Bar dataKey="absent" fill={COLORS[1]} />
              <Bar dataKey="activeDevices" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Records</h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading attendance records...</div>
        ) : attendanceRecords.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No attendance records found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id} className="border-border/30 hover:bg-white/5">
                    <TableCell className="text-foreground">{record.name}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                        record.status === 'present'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground">{record.time}</TableCell>
                    <TableCell className="text-muted-foreground">{record.device}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
        {!loading && attendanceRecords.length > 0 && (
          <ListPagination
            currentPage={currentPage}
            totalItems={attendanceRecords.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
