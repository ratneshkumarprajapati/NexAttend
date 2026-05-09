import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const getAuthToken = (state: RootState | undefined) => {
  if (!state) return null;
  return state.auth.token ?? null;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState | undefined;
      const token = getAuthToken(state) ?? (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Users', 'Profiles', 'Devices', 'Attendance', 'Presence'],
  endpoints: () => ({}),
});
