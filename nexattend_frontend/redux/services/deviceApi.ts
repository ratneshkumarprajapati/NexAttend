import { baseApi } from './baseApi';
import type { DeviceRecord } from '@/redux/models/device';

export const deviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyDevices: builder.query<DeviceRecord[], void>({
      query: () => ({ url: '/devices' }),
      transformResponse: (response: { data: DeviceRecord[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Devices' as const, id })),
              { type: 'Devices', id: 'LIST' },
            ]
          : [{ type: 'Devices', id: 'LIST' }],
    }),
    getDevices: builder.query<DeviceRecord[], void>({
      query: () => ({ url: '/devices' }),
      transformResponse: (response: { data: DeviceRecord[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Devices' as const, id })),
              { type: 'Devices', id: 'LIST' },
            ]
          : [{ type: 'Devices', id: 'LIST' }],
    }),
    registerDevice: builder.mutation<DeviceRecord, Partial<DeviceRecord>>({
      query: (payload) => ({ url: '/devices/register', method: 'POST', body: payload }),
      transformResponse: (response: { data: DeviceRecord }) => response.data,
      invalidatesTags: [{ type: 'Devices', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyDevicesQuery,
  useGetDevicesQuery,
  useRegisterDeviceMutation,
} = deviceApi;
