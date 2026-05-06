import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/lib/slices/authSlice';
import userReducer from '@/lib/slices/userSlice';
import profileReducer from '@/lib/slices/profileSlice';
import deviceReducer from '@/lib/slices/deviceSlice';
import presenceReducer from '@/lib/slices/presenceSlice';
import attendanceReducer from '@/lib/slices/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    profile: profileReducer,
    device: deviceReducer,
    presence: presenceReducer,
    attendance: attendanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
