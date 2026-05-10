export type UserRole = 'ADMIN' | 'STUDENT' | 'MANAGER';

export interface UserProfileSnapshot {
  firstName:    string;
  lastName:     string;
  phoneNo?:     string | null;
  department?:  string | null;
  enrolmentNo?: string | null;
  year?:        number | null;
}

export interface UserDeviceEntry {
  deviceName?: string;
  macAddress:  string;
}

export interface UserPayload {
  email:    string;
  password: string;
  role:     UserRole;
  profile?: Pick<UserProfileSnapshot, 'firstName' | 'lastName' | 'phoneNo'>;
}

export interface BulkStudentEntry {
  email:        string;
  password:     string;
  firstName:    string;
  lastName:     string;
  phoneNo?:     string;
  department?:  string;
  enrolmentNo?: string;
  year?:        number;
  deviceName?:  string;
  macAddress?:  string;
  devices?:     UserDeviceEntry[];
}

export interface BulkStudentPayload {
  students: BulkStudentEntry[];
}

export interface UserRecord {
  id:        string;
  email:     string;
  role:      UserRole | string;
  profile?:  UserProfileSnapshot | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkCreateResult {
  count: number;
  users: UserRecord[];
}

export interface UserState {
  selectedUser: UserRecord | null;
}
