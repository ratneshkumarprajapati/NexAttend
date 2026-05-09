import { baseApi } from './baseApi';

export interface PresenceRecord {
  id: string;
  userName: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  timestamp: string;
  deviceId?: string;
}

export const presenceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresence: builder.query<PresenceRecord[], void>({
      query: () => ({ url: '/presence' }),
      transformResponse: (response: { data: { records: PresenceRecord[] } }) => response.data.records,
      providesTags: ['Presence'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPresenceQuery } = presenceApi;
