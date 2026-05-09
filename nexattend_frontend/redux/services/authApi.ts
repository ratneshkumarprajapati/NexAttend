import { baseApi } from './baseApi';
import type { AuthResponse, AuthLoginPayload, AuthRegisterPayload } from '@/redux/models/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, AuthLoginPayload>({
      query: (payload) => ({
        url: '/auth/login',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: { data: AuthResponse }) => response.data,
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, AuthRegisterPayload>({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: { data: AuthResponse }) => response.data,
      invalidatesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation } = authApi;
