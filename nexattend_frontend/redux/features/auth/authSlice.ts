import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from '@/redux/models/auth';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const clientInitialState = typeof window !== 'undefined'
  ? {
      ...initialState,
      token: localStorage.getItem('accessToken'),
      user: (() => {
        const serialized = localStorage.getItem('user');
        if (!serialized) return null;
        try {
          return JSON.parse(serialized) as AuthUser;
        } catch {
          return null;
        }
      })(),
    }
  : initialState;

const authSlice = createSlice({
  name: 'auth',
  initialState: clientInitialState,
  reducers: {
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAuthSuccess(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setAuthLoading, setAuthSuccess, setAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
