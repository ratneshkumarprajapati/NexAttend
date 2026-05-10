'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/store/hooks';
import { logout } from '@/redux/features/auth/authSlice';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 z-40 h-16 glass backdrop-blur-xl border-b border-white/10 bg-linear-to-r from-background via-background/95 to-background/90">
      <div className="px-6 h-full flex items-center justify-between">
        {/* Empty left space for layout balance */}
        <div />
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle with smooth transition */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-lg hover:bg-white/10 transition-all duration-200 text-muted-foreground hover:text-foreground"
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
              <Button variant="ghost" className="gap-2 hover:bg-white/10 smooth-transition rounded-lg px-3 py-2 h-10">
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm text-foreground font-medium">{user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass backdrop-blur-xl border-white/20 bg-linear-to-br from-card/80 to-card/60">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email || 'no-email@demo.local'}</p>
                <p className="text-xs text-muted-foreground/60 mt-2 capitalize px-2 py-1 bg-white/5 rounded w-fit">
                  {user?.role || 'user'}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer focus:text-foreground">
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
