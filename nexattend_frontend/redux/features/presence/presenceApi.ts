import { baseApi } from '../../api/baseApi';
import { API_ROUTES } from '../../api/apiRoutes';
import type { PresenceRecord } from './presence.models';

type PresenceResponse =
  | { records?: PresenceRecord[]; data?: PresenceRecord[] }
  | PresenceRecord[];

export const presenceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresence: builder.query<PresenceRecord[], void>({
      query: () => API_ROUTES.PRESENCE.BASE,
      transformResponse: (res: PresenceResponse) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.records)) return res.records;
        if (Array.isArray(res.data)) return res.data;
        return [];
      },
      providesTags: ['Presence'],
    }),
  }),

  overrideExisting: false,
});

export const { useGetPresenceQuery } = presenceApi;
