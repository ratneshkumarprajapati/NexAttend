import { baseApi } from './baseApi';
import type { ProfileRecord } from '@/redux/models/profile';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileByUserId: builder.query<ProfileRecord, number>({
      query: (userId) => ({ url: `/profiles/${userId}` }),
      transformResponse: (response: { data: ProfileRecord }) => response.data,
      providesTags: (result, error, userId) => [{ type: 'Profiles', id: userId }],
    }),
    createProfile: builder.mutation<ProfileRecord, ProfileRecord>({
      query: (payload) => ({ url: '/profiles/create', method: 'POST', body: payload }),
      transformResponse: (response: { data: ProfileRecord }) => response.data,
      invalidatesTags: (result, error, payload) => [{ type: 'Profiles', id: payload.userId ?? 'LIST' }],
    }),
    updateProfile: builder.mutation<ProfileRecord, { userId: number; payload: Partial<ProfileRecord> }>({
      query: ({ userId, payload }) => ({ url: `/profiles/${userId}`, method: 'PUT', body: payload }),
      transformResponse: (response: { data: ProfileRecord }) => response.data,
      invalidatesTags: (result, error, { userId }) => [{ type: 'Profiles', id: userId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileByUserIdQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
} = profileApi;
