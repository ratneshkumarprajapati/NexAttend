import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import rootReducer from './rootReducer';
import { baseApi } from '../api/baseApi';

import '../features/auth/authApi';
import '../features/user/userApi';
import '../features/profile/profileApi';
import '../features/device/deviceApi';
import '../features/attendance/attendanceApi';
import '../features/presence/presenceApi';

export const store = configureStore({
  reducer: {
    ...rootReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
