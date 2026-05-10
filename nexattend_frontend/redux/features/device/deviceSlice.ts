import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DeviceFilters, DeviceState } from './device.models';

const initialState: DeviceState = {
  filters: {},
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDeviceFilters: (state, action: PayloadAction<DeviceFilters>) => {
      state.filters = action.payload;
    },
    resetDeviceFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setDeviceFilters, resetDeviceFilters } = deviceSlice.actions;
export default deviceSlice.reducer;
