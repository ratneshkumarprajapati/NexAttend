import type { AuthUser } from '@/redux/features/auth';
import type { ProfileRecord } from '@/redux/features/profile';

export type ProfileFormState = {
  firstName: string;
  lastName: string;
  phoneNo: string;
  department: string;
  enrolmentNo: string;
  year: string;
};

export type ProfileInformationProps = {
  user: AuthUser | null;
  profile?: ProfileRecord;
  isLoading: boolean;
};

export type ProfileInputProps = {
  label: string;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};
