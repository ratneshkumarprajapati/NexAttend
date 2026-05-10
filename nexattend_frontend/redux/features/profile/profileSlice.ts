import { createSlice } from '@reduxjs/toolkit';
import type { ProfileState } from './profile.models';

const initialState: ProfileState = {
  isEditing: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    startEditing: (state) => { state.isEditing = true; },
    stopEditing:  (state) => { state.isEditing = false; },
  },
});

export const { startEditing, stopEditing } = profileSlice.actions;
export default profileSlice.reducer;
