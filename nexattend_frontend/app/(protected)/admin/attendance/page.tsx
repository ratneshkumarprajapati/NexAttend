'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetAdminStudentMonitorQuery } from '@/redux/features/attendance';
import { AttendanceStatsCard } from '../../../../components/attendance/AttendanceStatsCard';
import { HourlyAttendanceChart } from '../../../../components/attendance/HourlyAttendanceChart';
import { StatusDistributionChart } from '../../../../components/attendance/StatusDistributionChart';
import { AttendanceRecordsTable } from '../../../../components/attendance/AttendanceRecordsTable';
import { StudentAttendanceCalendar } from '../../../../components/attendance/StudentAttendanceCalendar';
import {
  ChartGridSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from '@/components/common/page-skeletons';
import {
  getLocalDateString,
  getStudentName,
  generateHourlyAttendanceData,
  calculatePresenceDuration,
} from '@/utils/helpers';
import { DASHBOARD_POLLING_INTERVAL } from '@/utils/constants';
import type { AttendanceRecord } from '@/types';
import type { AttendanceFilterStatus } from '@/redux/features/attendance';

const attendanceQueryOptions = {
  pollingInterval: DASHBOARD_POLLING_INTERVAL,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  skipPollingIfUnfocused: true,
} as const;

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [statusFilter, setStatusFilter] = useState<AttendanceFilterStatus>('ALL');
  const {
    data: monitor,
    isLoading,
    isFetching,
    error,
  } = useGetAdminStudentMonitorQuery({
    date: selectedDate,
    status: statusFilter,
    limit: 100,
  }, attendanceQueryOptions);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);

  const summary = monitor?.summary;
  const students = useMemo(() => monitor?.students ?? [], [monitor?.students]);

  const statusData = useMemo(
    () => [
      { name: 'Present', value: summary?.presentStudents || 0 },
      { name: 'Absent', value: summary?.absentStudents || 0 },
      { name: 'Active Devices', value: summary?.activeDevices || 0 },
    ],
    [summary],
  );

  const hourlyData = useMemo(
    () => generateHourlyAttendanceData(students),
    [students],
  );

  const attendanceRecords = useMemo<AttendanceRecord[]>(
    () =>
      students.map((student) => ({
        id: student.id,
        name: getStudentName(student),
        status: student.attendance?.currentStatus?.toLowerCase() || 'absent',
        firstSeen: student.attendance?.daily?.firstSeen
          ? new Date(student.attendance.daily.firstSeen).toLocaleTimeString()
          : '-',
        lastSeen: student.attendance?.daily?.lastSeen
          ? new Date(student.attendance.daily.lastSeen).toLocaleTimeString()
          : '-',
        device:
          student.attendance?.activeSession?.device?.deviceName ||
          student.devices?.[0]?.deviceName ||
          '-',
        arrivalTime: student.attendance?.daily?.firstSeen || undefined,
        departureTime: student.attendance?.daily?.lastSeen || undefined,
      })),
    [students],
  );

  const handleExport = () => {
    if (attendanceRecords.length === 0) return;

    const csv = [
      'name,status,firstSeen,lastSeen,duration,device',
      ...attendanceRecords.map((record) => {
        const duration = calculatePresenceDuration(
          record.arrivalTime,
          record.departureTime,
        );
        return [
          record.name,
          record.status,
          record.firstSeen,
          record.lastSeen,
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

  const moveSelectedDate = (days: number) => {
    const nextDate = new Date(`${selectedDate}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + days);
    setSelectedDate(getLocalDateString(nextDate));
  };

  if (isLoading && !monitor) {
    return (
      <div className="space-y-8">
        <PageHeaderSkeleton />
        <StatCardsSkeleton count={3} />
        <ChartGridSkeleton />
        <div className="glass rounded-xl border border-border/50 p-6">
          <TableSkeleton columns={6} rows={8} />
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
          Failed to load attendance data
        </div>
      )}

      {/* Date Filter & Export */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => moveSelectedDate(-1)}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/5"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => moveSelectedDate(1)}
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleExport}
          className="ml-auto bg-primary bo hover:opacity-90"
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
        <div className="glass relative rounded-xl p-6 border border-border/50">
          <HourlyAttendanceChart data={hourlyData} />
          {isFetching && !isLoading && <ChartLoadingOverlay />}
        </div>
        <div className="glass relative rounded-xl p-6 border border-border/50">
          <StatusDistributionChart data={statusData} />
          {isFetching && !isLoading && <ChartLoadingOverlay />}
        </div>
      </div>

      {/* Records Table */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Attendance Records
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Click on any student to view their monthly attendance calendar
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as AttendanceFilterStatus)}
          >
            <SelectTrigger className="w-full bg-primary text-foreground hover:bg-primary md:w-40 [&_svg]:text-primary-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PRESENT">Present</SelectItem>
              <SelectItem value="ABSENT">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AttendanceRecordsTable
          records={attendanceRecords}
          loading={isLoading && !monitor}
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
        <DialogContent className="max-w-2xl bg-card/98 backdrop-blur-2xl border border-border/30 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.name || 'Student'} Attendance Overview
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChartLoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[1px]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-500 dark:border-slate-800 dark:border-t-slate-400" />
    </div>
  );
}
