import { baseApi } from '../../api/baseApi';
import { API_ROUTES } from '../../api/apiRoutes';
import { setAuthSuccess } from './authSlice';
import type {
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthResponseData,
} from './auth.models';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseData, AuthLoginPayload>({
      query: (payload) => ({
        url:    API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body:   payload,
      }),
      transformResponse: (res: { data: AuthResponseData }) => res.data,
      async onQueryStarted(_payload, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthSuccess({ user: data.user, token: data.token }));
        } catch {
          return;
        }
      },
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<AuthResponseData, AuthRegisterPayload>({
      query: (payload) => ({
        url:    API_ROUTES.AUTH.REGISTER,
        method: 'POST',
        body:   payload,
      }),
      transformResponse: (res: { data: AuthResponseData }) => res.data,
      async onQueryStarted(_payload, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAuthSuccess({ user: data.user, token: data.token }));
        } catch {
          return;
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),

  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation } = authApi;
