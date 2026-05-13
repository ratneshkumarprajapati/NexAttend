'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/store/hooks';
import { logout } from '@/redux/features/auth/authSlice';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut, RefreshCw, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { baseApi } from '@/redux/api/baseApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const handleRefresh = () => {
    const tags =
      pathname === '/dashboard'
        ? (['Attendance', 'Device', 'User'] as const)
        : pathname === '/presence'
          ? (['Presence'] as const)
          : pathname === '/devices'
            ? (['Device'] as const)
            : pathname === '/settings'
              ? (['Profile'] as const)
              : pathname.startsWith('/admin/students')
                ? (['User'] as const)
                : pathname.startsWith('/admin/devices') || pathname.startsWith('/admin/attendance')
                  ? (['Attendance'] as const)
                  : ([] as const);

    if (tags.length > 0) {
      dispatch(baseApi.util.invalidateTags([...tags]));
    }

    router.refresh();
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <nav className="glass fixed top-0 right-0 left-0 z-40 h-16 border-x-0 border-t-0 lg:left-64">
      <div className="px-6 h-full flex items-center justify-between">
        {/* Empty left space for layout balance */}
        <div />
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-10 w-10 rounded-md text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary dark:hover:text-foreground"
            title="Refresh current tab"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>

          {/* Theme toggle with smooth transition */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-md text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary dark:hover:text-foreground"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 " style={{ animationDuration: '0.3s' }} />
            ) : (
              <Moon className="h-5 w-5 animate-pulse" />
            )}
          </Button>

          {/* User menu with modern design */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="smooth-transition h-10 gap-2 rounded-md px-3 py-2 hover:bg-primary/10 hover:text-primary dark:hover:text-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm text-foreground font-medium">{user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass w-56">
              <div className="border-b border-border/70 px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email || 'no-email@demo.local'}</p>
                <p className="mt-2 w-fit rounded-md bg-primary/10 px-2 py-1 text-xs capitalize text-primary">
                  {user?.role || 'user'}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
