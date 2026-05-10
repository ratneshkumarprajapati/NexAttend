'use client';

import { ThemeProvider } from '@/components/theme-provider';
import type { PropsWithChildren } from 'react';
import { Analytics } from '@vercel/analytics/next';
import ReduxProvider from '@/redux/provider/ReduxProvider';

export function ClientWrapper({ children }: PropsWithChildren) {
  return (
    <ReduxProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </ThemeProvider>
    </ReduxProvider>
  );
}
