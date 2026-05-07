import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserRecord {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  users: UserRecord[];
  selectedUser: UserRecord | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUsers: (state, action: PayloadAction<UserRecord[]>) => {
      state.users = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<UserRecord | null>) => {
      state.selectedUser = action.payload;
    },
    addUser: (state, action: PayloadAction<UserRecord>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<UserRecord>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index > -1) {
        state.users[index] = action.payload;
      }
      if (state.selectedUser?.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null;
      }
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setUserLoading,
  setUsers,
  setSelectedUser,
  addUser,
  updateUser,
  removeUser,
  setUserError,
} = userSlice.actions;

export default userSlice.reducer;
