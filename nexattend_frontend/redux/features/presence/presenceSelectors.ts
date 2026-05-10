import type { RootState } from '../../store';

export const selectPresenceRecords = (state: RootState) => state.presence.records;
export const selectPresenceLoading = (state: RootState) => state.presence.isLoading;
export const selectPresenceError   = (state: RootState) => state.presence.error;
export const selectLastUpdated     = (state: RootState) => state.presence.lastUpdated;
export const selectPollInterval    = (state: RootState) => state.presence.pollInterval;
