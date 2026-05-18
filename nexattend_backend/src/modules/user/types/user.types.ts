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

export interface BulkStudentDeviceInput {
  deviceName?: string | undefined;
  macAddress?: string | undefined;
  phoneNo?: string | undefined;
}

export interface BulkStudentInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNo?: string | undefined;
  department?: string | undefined;
  enrolmentNo?: string | undefined;
  year?: number | undefined;
  preprationGoal?: unknown;
  deviceName?: string | undefined;
  macAddress?: string | undefined;
  devices?: BulkStudentDeviceInput[] | undefined;
}

export interface BulkCreateStudentsInput {
  students: BulkStudentInput[];
}
