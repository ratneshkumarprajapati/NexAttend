'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

interface ClientWrapperProps {
  children: ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </ThemeProvider>
    </Provider>
  );
}
