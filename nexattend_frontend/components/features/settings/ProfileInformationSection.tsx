'use client';

import { useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import {
  useCreateProfileMutation,
  useUpdateProfileMutation,
} from '@/redux/features/profile';
import { getErrorMessage } from '@/utils/errorHandler';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProfileFormState, ProfileInformationProps } from '@/types';
import { ProfileInput } from './ProfileInput';
import { buildInitialProfileForm, formatRole } from './settings-utils';

export function ProfileInformationSection({
  user,
  profile,
  isLoading,
}: ProfileInformationProps) {
  const [form, setForm] = useState(() => buildInitialProfileForm(user, profile));
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');
  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const saving = isCreating || isUpdating;

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setError('');
      setSavedMessage('');

      const userId = Number(user.id);
      const payload = {
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        phoneNo: form.phoneNo.trim() || undefined,
        department: form.department.trim() || undefined,
        enrolmentNo: form.enrolmentNo.trim() || undefined,
        year: form.year ? Number(form.year) : undefined,
      };

      if (profile) {
        await updateProfile({ userId, payload }).unwrap();
      } else {
        await createProfile({
          userId,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNo: form.phoneNo.trim(),
          department: form.department.trim(),
          enrolmentNo: form.enrolmentNo.trim(),
          year: form.year ? Number(form.year) : 0,
          preprationGoal: {
            target: '',
            focus: '',
          },
        }).unwrap();
      }

      setSavedMessage('Settings saved successfully');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save settings'));
    }
  };

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <UserCircle2 className="w-5 h-5" />
        Profile Information
      </h3>

      {savedMessage && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/20 p-3 text-sm text-green-400">
          {savedMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? <ProfileFormSkeleton /> : (
        <div className="grid gap-4 md:grid-cols-2">
          <ProfileInput label="First Name" value={form.firstName} onChange={(value) => updateField('firstName', value)} />
          <ProfileInput label="Last Name" value={form.lastName} onChange={(value) => updateField('lastName', value)} />
          <ProfileInput label="Email" value={user?.email || ''} disabled />
          <ProfileInput label="Phone" value={form.phoneNo} onChange={(value) => updateField('phoneNo', value)} />
          <ProfileInput label="Department" value={form.department} onChange={(value) => updateField('department', value)} />
          <ProfileInput label="Enrolment Number" value={form.enrolmentNo} onChange={(value) => updateField('enrolmentNo', value)} />
          <ProfileInput label="Year" type="number" value={form.year} onChange={(value) => updateField('year', value)} />
          <ProfileInput label="Role" value={formatRole(user?.role)} disabled />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => void handleSave()} disabled={saving || isLoading} className="bg-primary hover:opacity-90">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

function ProfileFormSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
