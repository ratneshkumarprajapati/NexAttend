'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { logout } from '@/redux/features/auth/authSlice';
import { useGetProfileByUserIdQuery } from '@/redux/features/profile';
import { Button } from '@/components/ui/button';
import {
  AppearanceSection,
  NotificationsSection,
  ProfileInformationSection,
  SecuritySection,
} from '@/components/features/settings';

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const { data: profile, isLoading: isProfileLoading } = useGetProfileByUserIdQuery(
    user?.id ? Number(user.id) : 0,
    { skip: !user?.id },
  );

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

      <ProfileInformationSection
        key={profile?.id || user?.id || 'profile'}
        user={user}
        profile={profile}
        isLoading={isProfileLoading}
      />
      <AppearanceSection theme={theme} setTheme={setTheme} />
      <NotificationsSection />
      <SecuritySection />

      <div className="flex justify-end">
        <Button
          onClick={handleLogout}
          className="text-red-400 hover:bg-red-500/10 border border-red-500/20"
          variant="ghost"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
