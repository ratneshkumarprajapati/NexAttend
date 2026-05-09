import { baseApi } from './baseApi';
import type { AdminStudentMonitorResponse } from '@/redux/models/attendance';

export interface AdminStudentMonitorFilters {
  date?: string;
  status?: 'ALL' | 'PRESENT' | 'ABSENT';
  page?: number;
  limit?: number;
  department?: string;
  year?: number;
  search?: string;
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStudentMonitor: builder.query<AdminStudentMonitorResponse, AdminStudentMonitorFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.date) params.set('date', filters.date);
        if (filters.status) params.set('status', filters.status);
        if (filters.page) params.set('page', String(filters.page));
        if (filters.limit) params.set('limit', String(filters.limit));
        if (filters.department) params.set('department', filters.department);
        if (filters.year) params.set('year', String(filters.year));
        if (filters.search) params.set('search', filters.search);
        const query = params.toString() ? `?${params.toString()}` : '';
        return { url: `/attendance/admin/students${query}` };
      },
      transformResponse: (response: { data: AdminStudentMonitorResponse }) => response.data,
      providesTags: ['Attendance'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminStudentMonitorQuery } = attendanceApi;
