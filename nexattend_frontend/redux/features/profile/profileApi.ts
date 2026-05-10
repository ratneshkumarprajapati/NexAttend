import { baseApi } from '../../api/baseApi';
import { API_ROUTES } from '../../api/apiRoutes';
import type {
  ProfileRecord,
  ProfilePayload,
  ProfileUpdatePayload,
} from './profile.models';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileByUserId: builder.query<ProfileRecord, number>({
      query: (userId) => API_ROUTES.PROFILES.BY_USER_ID(userId),
      transformResponse: (res: { data: ProfileRecord }) => res.data,
      providesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
    }),

    createProfile: builder.mutation<ProfileRecord, ProfilePayload>({
      query: (payload) => ({
        url:    API_ROUTES.PROFILES.CREATE,
        method: 'POST',
        body:   payload,
      }),
      transformResponse: (res: { data: ProfileRecord }) => res.data,
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Profile', id: userId }],
    }),

    updateProfile: builder.mutation<
      ProfileRecord,
      { userId: number; payload: ProfileUpdatePayload }
    >({
      query: ({ userId, payload }) => ({
        url:    API_ROUTES.PROFILES.BY_USER_ID(userId),
        method: 'PUT',
        body:   payload,
      }),
      transformResponse: (res: { data: ProfileRecord }) => res.data,
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Profile', id: userId }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetProfileByUserIdQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
} = profileApi;
