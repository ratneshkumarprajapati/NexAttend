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
import { cn } from '@/utils/utils';

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
          'glass fixed left-0 top-0 z-30 h-screen w-64 border-y-0 border-l-0 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col bg-sidebar">
          {/* Logo Section */}
          <div className="border-b border-sidebar-border bg-sidebar-accent/50 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-md bg-primary/20 blur-sm" />
                <div className="relative rounded-md bg-sidebar p-2">
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
                    'group relative flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border border-primary/20 bg-primary/10 text-primary shadow-sm shadow-primary/10'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className={cn('transition-all duration-200', isActive && 'scale-110')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
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
          className="fixed inset-0 z-20 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
