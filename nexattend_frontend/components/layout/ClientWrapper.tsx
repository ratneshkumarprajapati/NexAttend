'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import type { PropsWithChildren } from 'react';
import { Analytics } from '@vercel/analytics/next';

export function ClientWrapper({ children }: PropsWithChildren) {
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
