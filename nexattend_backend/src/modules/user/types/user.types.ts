export type UserRole = "STUDENT" | "ADMIN";

export interface CreateUserProfileInput {
  firstName: string;
  lastName: string;
  phoneNo?: string | null | undefined;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  profile?: CreateUserProfileInput | null | undefined;
}

export interface UpdateUserInput {
  email?: string | undefined;
  password?: string | undefined;
  role?: UserRole | undefined;
}
