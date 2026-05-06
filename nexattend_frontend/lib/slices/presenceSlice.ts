import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PresenceRecord {
  id: string;
  userId: string;
  userName: string;
  status: 'present' | 'absent' | 'late' | 'left_early';
  checkInTime?: string;
  checkOutTime?: string;
  timestamp: string;
  location?: string;
  deviceId?: string;
}

interface PresenceState {
  records: PresenceRecord[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  pollInterval: number; // in milliseconds
}

const initialState: PresenceState = {
  records: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  pollInterval: 5000, // 5 seconds
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setPresenceLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPresenceRecords: (state, action: PayloadAction<PresenceRecord[]>) => {
      state.records = action.payload;
      state.isLoading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    addPresenceRecord: (state, action: PayloadAction<PresenceRecord>) => {
      const existingIndex = state.records.findIndex(
        r => r.userId === action.payload.userId && 
             new Date(r.timestamp).toDateString() === new Date(action.payload.timestamp).toDateString()
      );
      if (existingIndex > -1) {
        state.records[existingIndex] = action.payload;
      } else {
        state.records.push(action.payload);
      }
    },
    setPresenceError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setPollInterval: (state, action: PayloadAction<number>) => {
      state.pollInterval = action.payload;
    },
  },
});

export const {
  setPresenceLoading,
  setPresenceRecords,
  addPresenceRecord,
  setPresenceError,
  setPollInterval,
} = presenceSlice.actions;
export default presenceSlice.reducer;
