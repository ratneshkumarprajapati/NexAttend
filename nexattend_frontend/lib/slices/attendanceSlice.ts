import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'left_early' | 'half_day';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  notes?: string;
}

interface AttendanceState {
  records: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  filters: {
    userId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    userName?: string;
  };
  selectedMonth: {
    year: number;
    month: number;
  };
}

const initialState: AttendanceState = {
  records: [],
  isLoading: false,
  error: null,
  filters: {},
  selectedMonth: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  },
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendanceLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAttendanceRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.records = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      const existingIndex = state.records.findIndex(
        r => r.userId === action.payload.userId && r.date === action.payload.date
      );
      if (existingIndex > -1) {
        state.records[existingIndex] = action.payload;
      } else {
        state.records.push(action.payload);
      }
    },
    updateAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.records.findIndex(r => r.id === action.payload.id);
      if (index > -1) {
        state.records[index] = action.payload;
      }
    },
    deleteAttendanceRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter(r => r.id !== action.payload);
    },
    setAttendanceError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAttendanceFilters: (state, action: PayloadAction<typeof state.filters>) => {
      state.filters = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<{ year: number; month: number }>) => {
      state.selectedMonth = action.payload;
    },
  },
});

export const {
  setAttendanceLoading,
  setAttendanceRecords,
  addAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  setAttendanceError,
  setAttendanceFilters,
  setSelectedMonth,
} = attendanceSlice.actions;
export default attendanceSlice.reducer;
