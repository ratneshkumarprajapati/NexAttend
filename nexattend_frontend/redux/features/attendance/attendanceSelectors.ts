import type { RootState } from '../../store';

export const selectAttendanceFilters = (state: RootState) => state.attendance.filters;
export const selectSelectedMonth     = (state: RootState) => state.attendance.selectedMonth;
