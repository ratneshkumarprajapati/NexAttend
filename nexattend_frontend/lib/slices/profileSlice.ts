import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileRecord {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNo: string;
  department: string;
  enrolmentNo: string;
  year: number;
  preprationGoal: {
    target: string;
    focus: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileState {
  profile: ProfileRecord | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProfile: (state, action: PayloadAction<ProfileRecord | null>) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<ProfileRecord>) => {
      state.profile = action.payload;
      state.error = null;
      state.isLoading = false;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.isLoading = false;
    },
    setProfileError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setProfileLoading,
  setProfile,
  updateProfile,
  clearProfile,
  setProfileError,
} = profileSlice.actions;

export default profileSlice.reducer;
