import type { AuthUser } from '@/redux/features/auth';
import type { ProfileRecord } from '@/redux/features/profile';
import type { ProfileFormState } from '@/types';

export function buildInitialProfileForm(
  user: AuthUser | null,
  profile?: ProfileRecord,
): ProfileFormState {
  if (profile) {
    return {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNo: profile.phoneNo || '',
      department: profile.department || '',
      enrolmentNo: profile.enrolmentNo || '',
      year: profile.year ? String(profile.year) : '',
    };
  }

  const [firstName = '', ...lastNameParts] = (user?.name || '').split(' ');
  return {
    firstName,
    lastName: lastNameParts.join(' '),
    phoneNo: '',
    department: '',
    enrolmentNo: '',
    year: '',
  };
}

export function formatRole(role?: string) {
  if (!role) return 'User';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}
