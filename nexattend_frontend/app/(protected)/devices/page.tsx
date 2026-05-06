'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setDevices, setDevicesLoading, setDeviceError, setDeviceFilters, addDevice } from '@/lib/slices/deviceSlice';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Smartphone, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function DevicesPage() {
  const dispatch = useAppDispatch();
  const { devices, isLoading, filters } = useAppSelector((state) => state.device);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    type: 'attendance_machine',
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      dispatch(setDevicesLoading(true));
      const response = await api.get('/devices');
      dispatch(setDevices(response.data.devices || []));
    } catch (error: any) {
      dispatch(setDeviceError(error.message));
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/devices', formData);
      dispatch(addDevice(response.data.device));
      setFormData({ name: '', identifier: '', type: 'attendance_machine' });
      setIsDialogOpen(false);
    } catch (error: any) {
      dispatch(setDeviceError(error.message));
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    dispatch(setDeviceFilters({ ...filters, search: term }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    dispatch(setDeviceFilters({ ...filters, status: status || undefined }));
  };

  const filteredDevices = devices.filter((device) => {
    if (searchTerm && !device.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter && device.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Device Management</h1>
          <p className="text-muted-foreground mt-1">Register and manage your attendance devices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Device</DialogTitle>
              <DialogDescription>Add a new attendance tracking device</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegisterDevice} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Device Name</label>
                <Input
                  placeholder="Main Entrance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Device ID</label>
                <Input
                  placeholder="DEV-001"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Device Type</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="attendance_machine">Attendance Machine</option>
                  <option value="biometric">Biometric Scanner</option>
                  <option value="mobile">Mobile Device</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Register Device
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="gap-2"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              className="px-3 py-2 border border-input rounded-md"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
          <CardDescription>Total: {filteredDevices.length} devices</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading devices...</div>
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">No devices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.identifier}</TableCell>
                      <TableCell className="capitalize">{device.type}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {device.registeredDate
                          ? format(new Date(device.registeredDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {device.lastSeen
                          ? format(new Date(device.lastSeen), 'MMM dd, HH:mm')
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
