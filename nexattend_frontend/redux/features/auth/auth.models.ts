export type UserRole = 'STUDENT' | 'ADMIN' | 'MANAGER';

export interface AuthLoginPayload {
  email:    string;
  password: string;
}

export interface AuthRegisterPayload {
  email:     string;
  password:  string;
  role:      UserRole;
  firstName: string;
  lastName:  string;
  phoneNo?:  string;
}

export interface AuthUser {
  id:         string;
  email:      string;
  role:       UserRole | string;
  name?:      string;
  firstName?: string;
  lastName?:  string;
  phoneNo?:   string;
  createdAt?: string;
}

export interface AuthResponseData {
  user:  AuthUser;
  token: string;
}

export interface AuthState {
  user:       AuthUser | null;
  token:      string | null;
  isHydrated: boolean;
}
