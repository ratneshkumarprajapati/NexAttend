import { baseApi } from '../../api/baseApi';
import { API_ROUTES } from '../../api/apiRoutes';
import type { DeviceRecord, DeviceRegisterPayload } from './device.models';

export const deviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyDevices: builder.query<DeviceRecord[], void>({
      query: () => API_ROUTES.DEVICES.BASE,
      transformResponse: (
        res: { data?: DeviceRecord[]; devices?: DeviceRecord[] } | DeviceRecord[],
      ) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.devices)) return res.devices;
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Device' as const, id })),
              { type: 'Device', id: 'LIST' },
            ]
          : [{ type: 'Device', id: 'LIST' }],
    }),

    registerDevice: builder.mutation<DeviceRecord, DeviceRegisterPayload>({
      query: (payload) => ({
        url:    API_ROUTES.DEVICES.REGISTER,
        method: 'POST',
        body:   payload,
      }),
      transformResponse: (res: { data: DeviceRecord }) => res.data,
      invalidatesTags: [{ type: 'Device', id: 'LIST' }],
    }),
  }),

  overrideExisting: false,
});

export const { useGetMyDevicesQuery, useRegisterDeviceMutation } = deviceApi;
