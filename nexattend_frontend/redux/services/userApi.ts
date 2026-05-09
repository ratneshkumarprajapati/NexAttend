import { baseApi } from './baseApi';
import type { BulkStudentPayload, BulkCreateStudentsResponse, UserRecord } from '@/redux/models/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<UserRecord[], void>({
      query: () => ({ url: '/users' }),
      transformResponse: (response: { data: UserRecord[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    getUserById: builder.query<UserRecord, string>({
      query: (id) => ({ url: `/users/${id}` }),
      transformResponse: (response: { data: UserRecord }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Users', id }],
    }),
    createUser: builder.mutation<UserRecord, Partial<UserRecord>>({
      query: (payload) => ({ url: '/users', method: 'POST', body: payload }),
      transformResponse: (response: { data: UserRecord }) => response.data,
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
    updateUser: builder.mutation<UserRecord, { id: string; payload: Partial<UserRecord> }>({
      query: ({ id, payload }) => ({ url: `/users/${id}`, method: 'PUT', body: payload }),
      transformResponse: (response: { data: UserRecord }) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      transformResponse: (response: { data: { success: boolean } }) => response.data,
      invalidatesTags: (result, error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
    }),
    bulkCreateStudents: builder.mutation<BulkCreateStudentsResponse, { students: BulkStudentPayload[] }>({
      query: (payload) => ({ url: '/users/bulk-students', method: 'POST', body: payload }),
      transformResponse: (response: { data: BulkCreateStudentsResponse }) => response.data,
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
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
