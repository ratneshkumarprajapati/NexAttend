import type { RootState } from '../../store';

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthToken   = (state: RootState) => state.auth.token;
export const selectIsAuthed    = (state: RootState) => Boolean(state.auth.token);
export const selectIsAuthHydrated = (state: RootState) => state.auth.isHydrated;
