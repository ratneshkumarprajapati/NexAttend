import { baseApi } from '../../api/baseApi';
import { API_ROUTES } from '../../api/apiRoutes';
import type {
  UserPayload,
  UserRecord,
  BulkStudentPayload,
  BulkCreateResult,
} from './user.models';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<UserRecord[], void>({
      query: () => API_ROUTES.USERS.BASE,
      transformResponse: (
        res: { data?: UserRecord[] | { users?: UserRecord[] } } | UserRecord[],
      ) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.users)) return res.data.users;
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<UserRecord, string>({
      query: (id) => API_ROUTES.USERS.BY_ID(id),
      transformResponse: (res: { data: UserRecord }) => res.data,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<UserRecord, UserPayload>({
      query: (payload) => ({
        url:    API_ROUTES.USERS.BASE,
        method: 'POST',
        body:   payload,
      }),
      transformResponse: (res: { data: UserRecord }) => res.data,
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<UserRecord, { id: string; payload: Partial<UserPayload> }>({
      query: ({ id, payload }) => ({
        url:    API_ROUTES.USERS.BY_ID(id),
        method: 'PUT',
        body:   payload,
      }),
      transformResponse: (res: { data: UserRecord }) => res.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url:    API_ROUTES.USERS.BY_ID(id),
        method: 'DELETE',
      }),
      transformResponse: (res: { data: { success: boolean } }) => res.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    bulkCreateStudents: builder.mutation<BulkCreateResult, BulkStudentPayload>({
      query: (payload) => ({
        url:    API_ROUTES.USERS.BULK_STUDENTS,
        method: 'POST',
        body:   payload,
      }),
      transformResponse: (res: { data?: BulkCreateResult } | BulkCreateResult) =>
        'data' in res && res.data ? res.data : (res as BulkCreateResult),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkCreateStudentsMutation,
} = userApi;
