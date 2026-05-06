import { api } from '@/lib/api';

export interface AttendanceMonitorFilters {
  date?: string;
  status?: 'ALL' | 'PRESENT' | 'ABSENT';
  page?: number;
  limit?: number;
  department?: string;
  year?: number;
  search?: string;
}

export interface AdminStudentMonitorResponse {
  total?: number;
  students?: any[];
  presentCount?: number;
  absentCount?: number;
  activeDevices?: number;
  [key: string]: any;
}

export const attendanceService = {
  async getAdminStudentMonitor(filters: AttendanceMonitorFilters = {}) {
    const searchParams = new URLSearchParams();

    if (filters.date) searchParams.set('date', filters.date);
    if (filters.status) searchParams.set('status', filters.status);
    if (filters.page) searchParams.set('page', String(filters.page));
    if (filters.limit) searchParams.set('limit', String(filters.limit));
    if (filters.department) searchParams.set('department', filters.department);
    if (filters.year) searchParams.set('year', String(filters.year));
    if (filters.search) searchParams.set('search', filters.search);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await api.get<{ data: AdminStudentMonitorResponse }>(`/attendance/admin/students${queryString}`);
    return response.data.data;
  },
};
