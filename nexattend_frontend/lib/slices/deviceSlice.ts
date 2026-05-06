import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Device {
  id: string;
  name: string;
  identifier: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  registeredDate: string;
  lastSeen?: string;
}

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    type?: string;
    search?: string;
  };
}

const initialState: DeviceState = {
  devices: [],
  isLoading: false,
  error: null,
  filters: {},
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDevicesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addDevice: (state, action: PayloadAction<Device>) => {
      state.devices.push(action.payload);
    },
    updateDevice: (state, action: PayloadAction<Device>) => {
      const index = state.devices.findIndex(d => d.id === action.payload.id);
      if (index > -1) {
        state.devices[index] = action.payload;
      }
    },
    deleteDevice: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(d => d.id !== action.payload);
    },
    setDeviceError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setDeviceFilters: (state, action: PayloadAction<typeof state.filters>) => {
      state.filters = action.payload;
    },
  },
});

export const {
  setDevicesLoading,
  setDevices,
  addDevice,
  updateDevice,
  deleteDevice,
  setDeviceError,
  setDeviceFilters,
} = deviceSlice.actions;
export default deviceSlice.reducer;
