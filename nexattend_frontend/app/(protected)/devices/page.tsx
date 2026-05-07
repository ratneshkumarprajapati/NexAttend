'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Smartphone } from 'lucide-react';
import { ListPagination } from '@/components/list-pagination';
import { deviceService, type DeviceRecord } from '@/lib/services/deviceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DeviceForm = {
  deviceName: string;
  macAddress: string;
};

const initialForm: DeviceForm = {
  deviceName: '',
  macAddress: '',
};

const PAGE_SIZE = 6;

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DeviceForm>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const records = await deviceService.getMyDevices();
      setDevices(records);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);
      const device = await deviceService.registerDevice({
        deviceName: formData.deviceName.trim(),
        macAddress: formData.macAddress.trim(),
      });
      setDevices((current) => [device, ...current]);
      setFormData(initialForm);
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to register device');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDevices = devices.filter((device) => {
    const name = (device.deviceName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term);
  });
  const totalPages = Math.max(1, Math.ceil(filteredDevices.length / PAGE_SIZE));
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full rounded-xl border border-border/40 bg-card/40 p-8 text-center text-muted-foreground">
            Loading devices...
          </div>
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

      {!isLoading && filteredDevices.length > 0 && (
        <ListPagination
          currentPage={currentPage}
          totalItems={filteredDevices.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
