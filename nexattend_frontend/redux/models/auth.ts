export type AuthRole = 'admin' | 'manager' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthRegisterPayload {
  email: string;
  password: string;
  role: 'STUDENT' | 'ADMIN' | 'MANAGER';
  firstName: string;
  lastName: string;
  phoneNo?: string;
}
