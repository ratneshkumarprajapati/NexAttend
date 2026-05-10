import type { RootState } from '../../store';

export const selectSelectedUser = (state: RootState) => state.user.selectedUser;
