import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  AttendanceMonitorFilters,
  AttendanceState,
  SelectedMonth,
} from './attendance.models';

const initialState: AttendanceState = {
  filters: {},
  selectedMonth: {
    year:  new Date().getFullYear(),
    month: new Date().getMonth(),
  },
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendanceFilters: (
      state,
      action: PayloadAction<AttendanceMonitorFilters>,
    ) => {
      state.filters = action.payload;
    },

    patchAttendanceFilters: (
      state,
      action: PayloadAction<Partial<AttendanceMonitorFilters>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetAttendanceFilters: (state) => {
      state.filters = {};
    },

    setSelectedMonth: (state, action: PayloadAction<SelectedMonth>) => {
      state.selectedMonth = action.payload;
    },
  },
});

export const {
  setAttendanceFilters,
  patchAttendanceFilters,
  resetAttendanceFilters,
  setSelectedMonth,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
