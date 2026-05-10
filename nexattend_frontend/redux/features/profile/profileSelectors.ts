import type { RootState } from '../../store';

export const selectProfileIsEditing = (state: RootState) => state.profile.isEditing;
