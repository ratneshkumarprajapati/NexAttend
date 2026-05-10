import { baseApi } from '../../api/baseApi';
import { API_ROUTES } from '../../api/apiRoutes';
import type {
  AttendanceMonitorFilters,
  AdminStudentMonitorResponse,
} from './attendance.models';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStudentMonitor: builder.query<
      AdminStudentMonitorResponse,
      AttendanceMonitorFilters
    >({
      query: (filters = {}) => {
        const params = Object.fromEntries(
          Object.entries(filters).filter(
            ([, v]) => v !== undefined && v !== null && v !== '',
          ),
        );
        return { url: API_ROUTES.ATTENDANCE.ADMIN_STUDENTS, params };
      },
      transformResponse: (res: { data: AdminStudentMonitorResponse }) => res.data,
      providesTags: ['Attendance'],
    }),
  }),

  overrideExisting: false,
});

export const { useGetAdminStudentMonitorQuery } = attendanceApi;
