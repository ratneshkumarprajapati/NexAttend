'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setAuthSuccess, setAuthError, setAuthLoading } from '@/lib/slices/authSlice';
import { authService } from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNo: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'admin' | 'student'>('student');


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    dispatch(setAuthLoading(true));

    try {
      const authData = await authService.register({
        email: formData.email,
        password: formData.password,
        role: role === 'admin' ? 'ADMIN' : 'STUDENT',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNo: formData.phoneNo || undefined,
      });

      const normalizedRole = (authData.user.role?.toLowerCase() === 'admin'
        ? 'admin'
        : authData.user.role?.toLowerCase() === 'manager'
        ? 'manager'
        : 'user') as 'admin' | 'manager' | 'user';
      const user = {
        ...authData.user,
        role: normalizedRole,
        name: authData.user.name ?? `${authData.user.firstName ?? formData.firstName}${authData.user.lastName ? ` ${authData.user.lastName}` : ''}`.trim(),
      };

      dispatch(setAuthSuccess({ user, token: authData.token }));
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-background via-background to-background/80 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md px-4">

        {/* Glass Card */}
        <div className="backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl bg-white/5 dark:bg-white/5">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Register for NexAttend
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Demo badge */}
            {/* <div className="p-3 bg-primary/20 border border-primary/30 rounded-lg text-xs text-primary/80 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Demo Mode: Create account with any credentials
            </div> */}

            {/* Error */}
            {error && (
              <div className="p-3 bg-destructive/20 border border-destructive/30 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}


            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">
                Select Role
              </label>

              <div className="flex gap-2">
                {(['student', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-lg font-medium border-2 transition-all capitalize ${role === r
                      ? 'border-primary bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                      : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <section className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  First Name
                </label>
                <Input
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10"
                />
              </section>
              <section className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <Input
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10"
                />
              </section>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <Input
                name="phoneNo"
                type="tel"
                placeholder="9876543210"
                value={formData.phoneNo}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10"
              />
            </div>

            <section className='flex gap-2'>


              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10"
                />
              </div>
            </section>



            {/* Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full  hover:opacity-90 text-foreground font-semibold py-2.5 transition-all"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
