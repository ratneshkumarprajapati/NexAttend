import type { RootState } from '../../store';

export const selectDeviceFilters = (state: RootState) => state.device.filters;
