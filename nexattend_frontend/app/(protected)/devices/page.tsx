'use client';

import { useState } from 'react';
import { Plus, Search, Smartphone } from 'lucide-react';
import { ListPagination } from '@/components/list-pagination';
import {
  useGetMyDevicesQuery,
  useRegisterDeviceMutation,
} from '@/redux/features/device';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/utils/errorHandler';

type DeviceForm = {
  deviceName: string;
  macAddress: string;
};

const initialForm: DeviceForm = {
  deviceName: '',
  macAddress: '',
};

const PAGE_SIZE = 10;

export default function DevicesPage() {
  const {
    data: devices = [],
    isLoading,
    isFetching,
    error: loadError,
  } = useGetMyDevicesQuery();
  const [registerDevice, { isLoading: isSaving }] = useRegisterDeviceMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DeviceForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      await registerDevice({
        deviceName: formData.deviceName.trim(),
        macAddress: formData.macAddress.trim(),
      }).unwrap();
      setFormData(initialForm);
      setIsDialogOpen(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to register device'));
    }
  };

  const filteredDevices = devices.filter((device) => {
    const name = (device.deviceName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term);
  });
  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDevices = filteredDevices.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Devices</h1>
          <p className="text-muted-foreground mt-1">Register and manage the devices linked to your account</p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen((current) => !current)}>
          <Plus className="h-4 w-4" />
          Register Device
        </Button>
      </div>

      {(error || loadError) && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error || 'Failed to load devices'}
        </div>
      )}

      {isDialogOpen && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Register New Device</h3>
          <form onSubmit={handleRegisterDevice} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Device Name</label>
                <Input
                  placeholder="Laptop or phone name"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">MAC Address</label>
                <Input
                  placeholder="AA:BB:CC:DD:EE:FF"
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Registering...' : 'Register Device'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 min-w-64 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading || isFetching ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass rounded-xl border border-border/40 p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))
        ) : filteredDevices.length === 0 ? (
          <div className="col-span-full rounded-xl border border-border/40 bg-card/40 p-8 text-center text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto opacity-50 mb-3" />
            No devices found
          </div>
        ) : (
          paginatedDevices.map((device) => (
            <div key={device.id} className="glass rounded-xl border border-border/40 p-6 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">{device.deviceName || 'Unnamed Device'}</h3>
                <p className="text-xs text-muted-foreground mt-1">Status: {device.status || 'registered'}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="text-foreground">{device.createdAt ? new Date(device.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Seen</p>
                  <p className="text-foreground">{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && !isFetching && filteredDevices.length > 0 && (
        <ListPagination
          currentPage={safeCurrentPage}
          totalItems={filteredDevices.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
