'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { attendanceService, type AdminStudentMonitorResponse } from '@/lib/services/attendanceService';
import { AttendanceStatsCard } from './components/AttendanceStatsCard';
import { HourlyAttendanceChart } from './components/HourlyAttendanceChart';
import { StatusDistributionChart } from './components/StatusDistributionChart';
import { AttendanceRecordsTable } from './components/AttendanceRecordsTable';
import { StudentAttendanceCalendar } from './components/StudentAttendanceCalendar';
import {
  getLocalDateString,
  getStudentName,
  generateHourlyAttendanceData,
  calculatePresenceDuration,
  type AttendanceStatus,
} from './utils/helpers';
export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [monitor, setMonitor] = useState<AdminStudentMonitorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration fix: only render interactive content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

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
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load attendance data',
      );
    } finally {
      setLoading(false);
    }
  };

  const summary = monitor?.summary;
  const students = monitor?.students || [];

  const hourlyData = useMemo(
    () => generateHourlyAttendanceData(summary?.presentStudents || 0),
    [summary?.presentStudents],
  );

  const statusData = useMemo(
    () => [
      { name: 'Present', value: summary?.presentStudents || 0 },
      { name: 'Absent', value: summary?.absentStudents || 0 },
      { name: 'Active Devices', value: summary?.activeDevices || 0 },
    ],
    [summary],
  );

  const attendanceRecords = useMemo(
    () =>
      students.map((student) => ({
        id: student.publicId,
        name: getStudentName(student),
        status: student.attendance?.currentStatus?.toLowerCase() || 'absent',
        time:
          student.attendance?.activeSession?.lastSeen
            ? new Date(
                student.attendance.activeSession.lastSeen,
              ).toLocaleTimeString()
            : '-',
        device:
          student.attendance?.activeSession?.device?.deviceName ||
          student.devices?.[0]?.deviceName ||
          '-',
        arrivalTime: student.attendance?.activeSession?.startTime,
        departureTime: student.attendance?.activeSession?.lastSeen,
      })),
    [students],
  );

  const handleExport = () => {
    if (attendanceRecords.length === 0) return;

    const csv = [
      'name,status,time,duration,device',
      ...attendanceRecords.map((record) => {
        const duration = calculatePresenceDuration(
          record.arrivalTime,
          record.departureTime,
        );
        return [
          record.name,
          record.status,
          record.time,
          duration || '-',
          record.device,
        ].join(',');
      }),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,
    );
    element.setAttribute('download', `attendance-${selectedDate}.csv`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-muted/30 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 bg-muted/30 rounded-xl animate-pulse"
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Attendance Monitoring
        </h1>
        <p className="mt-1 text-muted-foreground">
          Live attendance records with real-time analytics
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Date Filter & Export */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/5"
          />
        </div>
        <Button
          onClick={handleExport}
          className="ml-auto bg-linear-to-r from-primary to-secondary hover:opacity-90"
          disabled={attendanceRecords.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <AttendanceStatsCard
          label="Present Today"
          value={summary?.presentStudents || 0}
          variant="present"
        />
        <AttendanceStatsCard
          label="Absent Today"
          value={summary?.absentStudents || 0}
          variant="absent"
        />
        <AttendanceStatsCard
          label="Active Devices"
          value={summary?.activeDevices || 0}
          variant="late"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-xl p-6 border border-border/50">
          <HourlyAttendanceChart data={hourlyData} />
        </div>
        <div className="glass rounded-xl p-6 border border-border/50">
          <StatusDistributionChart data={statusData} />
        </div>
      </div>

      {/* Records Table */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Attendance Records
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click on any student to view their monthly attendance calendar
          </p>
        </div>
        <AttendanceRecordsTable
          records={attendanceRecords}
          loading={loading}
          onRowClick={(record) => {
            setSelectedStudent({
              id: record.id,
              name: record.name,
              status: record.status,
            });
            setStudentDialogOpen(true);
          }}
        />
      </div>

      {/* Student Calendar Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-w-4xl bg-slate-950/90 backdrop-blur-2xl ring-1 ring-white/10 border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.name || 'Student'} Attendance Overview
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Monthly attendance calendar for the current month
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <StudentAttendanceCalendar
              studentId={selectedStudent.id}
              currentStatus={selectedStudent.status}
            />
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
