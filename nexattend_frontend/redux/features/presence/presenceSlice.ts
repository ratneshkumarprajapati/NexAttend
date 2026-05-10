import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PresenceRecord, PresenceState } from './presence.models';

const initialState: PresenceState = {
  records:      [],
  isLoading:    false,
  error:        null,
  lastUpdated:  null,
  pollInterval: 5_000,
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setPresenceLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setPresenceRecords: (state, action: PayloadAction<PresenceRecord[]>) => {
      state.records     = action.payload;
      state.isLoading   = false;
      state.error       = null;
      state.lastUpdated = new Date().toISOString();
    },

    upsertPresenceRecord: (state, action: PayloadAction<PresenceRecord>) => {
      const incoming = action.payload;
      const idx = state.records.findIndex(
        (r) =>
          r.userId === incoming.userId &&
          new Date(r.timestamp).toDateString() ===
            new Date(incoming.timestamp).toDateString(),
      );

      if (idx > -1) {
        state.records[idx] = incoming;
      } else {
        state.records.push(incoming);
      }

      state.lastUpdated = new Date().toISOString();
    },

    setPresenceError: (state, action: PayloadAction<string>) => {
      state.error     = action.payload;
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
  upsertPresenceRecord,
  setPresenceError,
  setPollInterval,
} = presenceSlice.actions;

export default presenceSlice.reducer;
