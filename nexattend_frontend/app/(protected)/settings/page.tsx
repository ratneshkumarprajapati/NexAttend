'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { Bell, Lock, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = () => {
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400">
          {savedMessage}
        </div>
      )}

      {/* Profile Section */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Profile Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Name</label>
            <Input
              defaultValue={user?.name || ''}
              disabled
              className="bg-white/5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Email</label>
            <Input
              defaultValue={user?.email || ''}
              disabled
              className="bg-white/5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Role</label>
            <Input
              defaultValue={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
              disabled
              className="bg-white/5"
            />
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Appearance
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
          <div className="flex gap-2">
            {['light', 'dark'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium smooth-transition border-2 capitalize ${
                  theme === t
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border bg-white/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg smooth-transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-sm text-foreground">Email notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg smooth-transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-sm text-foreground">Attendance alerts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg smooth-transition">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-sm text-foreground">Weekly reports</span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security
        </h3>
        <Button variant="ghost" className="w-full text-left justify-start text-muted-foreground hover:text-foreground">
          Change Password
        </Button>
        <Button variant="ghost" className="w-full text-left justify-start text-muted-foreground hover:text-foreground">
          Two-Factor Authentication
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={handleLogout}
          className="text-red-400 hover:bg-red-500/10 border border-red-500/20"
          variant="ghost"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
