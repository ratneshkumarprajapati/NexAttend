'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import {
  BarChart3,
  Smartphone,
  Users,
  Calendar,
  Menu,
  X,
  Home,
  Settings,
  Upload,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const studentNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'My Attendance',
    href: '/attendance',
    icon: Calendar,
  },
  {
    name: 'Devices',
    href: '/devices',
    icon: Smartphone,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Students',
    href: '/admin/students',
    icon: Users,
  },
  {
    name: 'Devices',
    href: '/admin/devices',
    icon: Smartphone,
  },
  {
    name: 'Attendance',
    href: '/admin/attendance',
    icon: Calendar,
  },
  {
    name: 'Bulk Upload',
    href: '/admin/bulk-upload',
    icon: Upload,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const navigation = isAdmin ? adminNavigation : studentNavigation;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="h-10 w-10"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen w-64 glass backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar/90">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary/20 via-accent/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-75 group-hover:opacity-100 smooth-transition" />
                <div className="relative bg-sidebar rounded-lg p-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NexAttend</h1>
                <p className="text-xs text-muted-foreground">Attendance System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'bg-gradient-to-r from-primary/30 to-accent/20 text-primary border border-primary/30 shadow-lg shadow-primary/10'
                      : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                  )}
                >
                  <div className={cn('transition-all duration-200', isActive && 'scale-110')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 bg-gradient-to-t from-primary/5 to-transparent">
            <p className="text-xs text-muted-foreground">
              © 2026 NexAttend
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">v1.0.0 • Attendance System</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
