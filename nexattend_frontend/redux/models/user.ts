export interface UserProfile {
  firstName?: string | null;
  lastName?: string | null;
  phoneNo?: string | null;
  avatarUrl?: string | null;
  department?: string | null;
  enrolmentNo?: string | null;
  year?: number | null;
}

export interface UserRecord {
  id: string;
  email: string;
  role: string;
  profile?: UserProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkStudentPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNo?: string;
  department?: string;
  enrolmentNo?: string;
  year?: number;
  devices?: Array<{
    deviceName: string;
    macAddress: string;
  }>;
}

export interface BulkCreateStudentsResponse {
  count: number;
  students?: UserRecord[];
}
