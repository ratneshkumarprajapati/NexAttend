'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setAuthSuccess, setAuthError, setAuthLoading } from '@/lib/slices/authSlice';
import { authService } from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BarChart3, ArrowRight, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    dispatch(setAuthLoading(true));

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const authData = await authService.login({ email, password });
      const normalizedRole = (authData.user.role?.toLowerCase() === 'admin'
        ? 'admin'
        : authData.user.role?.toLowerCase() === 'manager'
        ? 'manager'
        : 'user') as 'admin' | 'manager' | 'user';
      const user = {
        ...authData.user,
        role: normalizedRole,
        name: authData.user.name ?? `${authData.user.firstName ?? authData.user.email.split('@')[0]}${authData.user.lastName ? ` ${authData.user.lastName}` : ''}`.trim(),
      };
      dispatch(setAuthSuccess({ user, token: authData.token }));
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-background via-background to-background/80 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md px-4">
        {/* Glass card with modern design */}
        <div className="glass backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* Logo and title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-linear-to-br from-primary to-accent rounded-lg">
                <BarChart3 className="w-6 h-6 text-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">NexAttend</h1>
            </div>
            <p className="text-sm text-muted-foreground">Real-time attendance management system</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Demo mode badge */}
            <div className="p-3 bg-primary/20 border border-primary/30 rounded-lg text-xs text-primary/80 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Demo Mode: Use any email and password
            </div>

          

            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/20 border border-destructive/30 rounded-lg text-sm text-destructive flex items-start gap-2">
                <div className="mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 smooth-transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 smooth-transition"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full  hover:opacity-90 text-foreground font-semibold py-2.5 smooth-transition group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 smooth-transition" />
                </>
              )}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-muted-foreground">
              New to NexAttend?{' '}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 font-medium smooth-transition hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
