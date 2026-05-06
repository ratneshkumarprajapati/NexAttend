'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24'];

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dailyData = [
    { name: 'Mon', present: 45, absent: 5, late: 3 },
    { name: 'Tue', present: 48, absent: 2, late: 2 },
    { name: 'Wed', present: 46, absent: 4, late: 2 },
    { name: 'Thu', present: 47, absent: 3, late: 2 },
    { name: 'Fri', present: 43, absent: 7, late: 2 },
  ];

  const statusData = [
    { name: 'Present', value: 45, fill: COLORS[2] },
    { name: 'Absent', value: 5, fill: COLORS[0] },
    { name: 'Late', value: 3, fill: COLORS[3] },
  ];

  const attendanceRecords = [
    { id: '1', name: 'Ratnesh Kumar', status: 'present', time: '08:45 AM', device: 'Device-1' },
    { id: '2', name: 'John Doe', status: 'late', time: '09:15 AM', device: 'Device-2' },
    { id: '3', name: 'Jane Smith', status: 'absent', time: '-', device: '-' },
    { id: '4', name: 'Mike Wilson', status: 'present', time: '08:30 AM', device: 'Device-1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Monitoring</h1>
        <p className="text-muted-foreground mt-1">View and manage student attendance records</p>
      </div>

      {/* Date Filter and Export */}
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
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 ml-auto">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Trend */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff/10" />
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="present" fill={COLORS[2]} />
              <Bar dataKey="absent" fill={COLORS[0]} />
              <Bar dataKey="late" fill={COLORS[3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Distribution */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Today&apos;s Status</h3>
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

      {/* Attendance Records Table */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Today&apos;s Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50">
              <tr className="text-left text-muted-foreground">
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Check-in Time</th>
                <th className="pb-3 font-semibold">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="text-foreground hover:bg-white/5 smooth-transition">
                  <td className="py-3">{record.name}</td>
                  <td className="py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                      record.status === 'present'
                        ? 'bg-green-500/20 text-green-400'
                        : record.status === 'late'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3">{record.time}</td>
                  <td className="py-3 text-muted-foreground">{record.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
