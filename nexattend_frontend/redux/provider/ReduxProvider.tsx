'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { hydrateAuth } from '../features/auth/authSlice';
import type { AuthUser } from '../features/auth';

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const rawUser = localStorage.getItem('user');
    let user: AuthUser | null = null;

    if (rawUser) {
      try {
        user = JSON.parse(rawUser) as AuthUser;
      } catch {
        localStorage.removeItem('user');
      }
    }

    store.dispatch(hydrateAuth({ user, token }));
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
