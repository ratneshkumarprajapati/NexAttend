export type UserRole = "STUDENT" | "ADMIN";

export interface CreateUserInput {
  email: string;
  password:string;
  role: UserRole;
}

export interface UpdateUserInput {
  email?: string|undefined;
  password?:string|undefined;
  role?: UserRole|undefined;
}