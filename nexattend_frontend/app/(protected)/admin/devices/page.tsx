'use client';

import { useMemo, useState } from 'react';
import { Search, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { ListPagination } from '@/components/list-pagination';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAdminStudentMonitorQuery } from '@/redux/features/attendance';
import { TableSkeleton } from '@/components/common/page-skeletons';

type AdminDeviceRecord = {
  id: string;
  deviceName: string;
  ownerName: string;
  ownerEmail: string;
  department: string;
  status: 'online' | 'offline';
  lastSeen: string | null;
  createdAt: string | null;
};

const PAGE_SIZE = 10;

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AdminDevicesPage() {
  const {
    data: monitor,
    isLoading,
    isFetching,
    error: loadError,
  } = useGetAdminStudentMonitorQuery({
    date: getLocalDateString(),
    limit: 100,
  });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const devices = useMemo<AdminDeviceRecord[]>(() => {
    return (monitor?.students || []).flatMap((student) => {
        const ownerName = [student.profile?.firstName, student.profile?.lastName].filter(Boolean).join(' ') || student.email;
        const activeDeviceId = student.attendance?.activeSession?.device?.id;
        const lastSeen = student.attendance?.activeSession?.lastSeen || null;

        return (student.devices || []).map((device, index) => ({
          id: device.id || `${student.id}-${index}`,
          deviceName: device.deviceName || 'Unknown Device',
          ownerName,
          ownerEmail: student.email,
          department: student.profile?.department || 'N/A',
          status: device.id && activeDeviceId === device.id ? 'online' : 'offline',
          lastSeen: device.id && activeDeviceId === device.id ? lastSeen : null,
          createdAt: device.createdAt || null,
        }));
      });
  }, [monitor]);

  const filteredDevices = devices.filter((device) => {
    const term = search.toLowerCase();
    return (
      device.deviceName.toLowerCase().includes(term) ||
      device.ownerName.toLowerCase().includes(term) ||
      device.ownerEmail.toLowerCase().includes(term)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDevices = filteredDevices.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Device Management</h1>
        <p className="text-muted-foreground mt-1">Live student device inventory from the attendance monitor</p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load devices
        </div>
      )}

      <div className="flex-1 min-w-64 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search devices by name, owner, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 bg-white/5"
        />
      </div>

      <div className="glass rounded-xl border border-border/40 p-6">
        {isLoading || isFetching ? (
          <TableSkeleton columns={7} rows={8} />
        ) : filteredDevices.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No devices found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Device</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDevices.map((device) => (
                <TableRow key={device.id} className="border-border/30 hover:bg-white/5">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span>{device.deviceName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{device.ownerName}</TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {device.ownerEmail}
                  </TableCell>
                  <TableCell className="text-foreground">{device.department}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ${
                      device.status === 'online' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {device.status === 'online' ? (
                        <Wifi className="h-3 w-3" />
                      ) : (
                        <WifiOff className="h-3 w-3" />
                      )}
                      {device.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Offline'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      {!isLoading && !isFetching && filteredDevices.length > 0 && (
        <ListPagination
          currentPage={safeCurrentPage}
          totalItems={filteredDevices.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
      </div>

    </div>
  );
}
