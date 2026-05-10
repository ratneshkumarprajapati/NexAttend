import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserRecord, UserState } from './user.models';

const initialState: UserState = {
  selectedUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<UserRecord | null>) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const { setSelectedUser, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
