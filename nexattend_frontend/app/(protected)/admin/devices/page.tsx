'use client';

import { useState } from 'react';
import { Plus, Trash2, Wifi, WifiOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Device {
  id: string;
  name: string;
  macAddress: string;
  location: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Device-1',
      macAddress: 'AA:BB:CC:DD:EE:01',
      location: 'Entrance',
      status: 'online',
      lastSeen: 'Just now',
    },
    {
      id: '2',
      name: 'Device-2',
      macAddress: 'AA:BB:CC:DD:EE:02',
      location: 'Hallway',
      status: 'online',
      lastSeen: '2 minutes ago',
    },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', macAddress: '', location: '' });

  const filteredDevices = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.macAddress.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDevice = () => {
    if (formData.name && formData.macAddress) {
      setDevices([...devices, {
        id: Math.random().toString(),
        ...formData,
        status: 'online',
        lastSeen: 'Just now',
      }]);
      setFormData({ name: '', macAddress: '', location: '' });
      setShowForm(false);
    }
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Device Management</h1>
        <p className="text-muted-foreground mt-1">Register and manage attendance devices</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search devices by name or MAC address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5"
          />
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Device
        </Button>
      </div>

      {/* Add Device Form */}
      {showForm && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Register New Device</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Device Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5"
            />
            <Input
              placeholder="MAC Address (AA:BB:CC:DD:EE:FF)"
              value={formData.macAddress}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
              className="bg-white/5"
            />
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-white/5"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDevice}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Register Device
            </Button>
          </div>
        </div>
      )}

      {/* Devices Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDevices.map((device) => (
          <div key={device.id} className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{device.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{device.macAddress}</p>
              </div>
              <div className="flex gap-1">
                {device.status === 'online' ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/30">
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm text-foreground">{device.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Seen</p>
                <p className="text-sm text-foreground">{device.lastSeen}</p>
              </div>
              <div>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  device.status === 'online'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {device.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-400 hover:bg-red-500/10"
              onClick={() => handleDeleteDevice(device.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Device
            </Button>
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No devices found</p>
        </div>
      )}
    </div>
  );
}
