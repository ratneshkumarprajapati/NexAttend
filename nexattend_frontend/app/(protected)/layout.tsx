'use client';

import { useAppSelector } from '@/redux/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { AppShellSkeleton } from '@/components/common/page-skeletons';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isHydrated = useAppSelector((state) => state.auth.isHydrated);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      <main className="lg:ml-64 pt-16 pb-8">
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
