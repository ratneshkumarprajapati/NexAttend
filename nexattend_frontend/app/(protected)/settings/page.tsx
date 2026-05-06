'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { Bell, Lock, LogOut, Moon, Sun, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/slices/authSlice';
import { profileService } from '@/lib/services/profileService';

type ProfileForm = {
  firstName: string;
  lastName: string;
  phoneNo: string;
  department: string;
  enrolmentNo: string;
  year: string;
};

const initialProfileForm: ProfileForm = {
  firstName: '',
  lastName: '',
  phoneNo: '',
  department: '',
  enrolmentNo: '',
  year: '',
};

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>(initialProfileForm);

  useEffect(() => {
    void loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const profile = await profileService.getProfileByUserId(Number(user.id));
      setProfileExists(true);
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNo: profile.phoneNo || '',
        department: profile.department || '',
        enrolmentNo: profile.enrolmentNo || '',
        year: profile.year ? String(profile.year) : '',
      });
    } catch {
      setProfileExists(false);
      setProfileForm({
        ...initialProfileForm,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setError('');
      const payload = {
        firstName: profileForm.firstName.trim() || undefined,
        lastName: profileForm.lastName.trim() || undefined,
        phoneNo: profileForm.phoneNo.trim() || undefined,
        department: profileForm.department.trim() || undefined,
        enrolmentNo: profileForm.enrolmentNo.trim() || undefined,
        year: profileForm.year ? Number(profileForm.year) : undefined,
      };

      if (profileExists) {
        await profileService.updateProfile(Number(user.id), payload);
      } else {
        await profileService.createProfile({
          userId: Number(user.id),
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          phoneNo: profileForm.phoneNo.trim() || undefined,
          department: profileForm.department.trim() || undefined,
          enrolmentNo: profileForm.enrolmentNo.trim() || undefined,
          year: profileForm.year ? Number(profileForm.year) : undefined,
          preprationGoal: {
            target: '',
            focus: '',
          },
        });
        setProfileExists(true);
      }

      setSavedMessage('Settings saved successfully');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and profile details</p>
      </div>

      {savedMessage && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400">
          {savedMessage}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <UserCircle2 className="w-5 h-5" />
          Profile Information
        </h3>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading profile...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">First Name</label>
              <Input value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} className="bg-white/5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Last Name</label>
              <Input value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} className="bg-white/5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Email</label>
              <Input value={user?.email || ''} disabled className="bg-white/5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Phone</label>
              <Input value={profileForm.phoneNo} onChange={(e) => setProfileForm({ ...profileForm, phoneNo: e.target.value })} className="bg-white/5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Department</label>
              <Input value={profileForm.department} onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} className="bg-white/5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Enrolment Number</label>
              <Input value={profileForm.enrolmentNo} onChange={(e) => setProfileForm({ ...profileForm, enrolmentNo: e.target.value })} className="bg-white/5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Year</label>
              <Input type="number" min="1" value={profileForm.year} onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })} className="bg-white/5" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Role</label>
              <Input value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} disabled className="bg-white/5" />
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Appearance
        </h3>
        <div className="flex gap-2">
          {['light', 'dark'].map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium smooth-transition border-2 capitalize ${
                theme === mode
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border bg-white/5 text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg smooth-transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-foreground">Email notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg smooth-transition">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-foreground">Attendance alerts</span>
          </label>
        </div>
      </div>

      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security
        </h3>
        <p className="text-sm text-muted-foreground">Password changes are not exposed by the current backend APIs yet.</p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 border border-red-500/20" variant="ghost">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <Button onClick={() => void handleSave()} disabled={saving || loading} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
