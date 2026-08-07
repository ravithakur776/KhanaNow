import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UtensilsCrossed, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Checkbox } from '../../components/ui/checkbox';
import { Card } from '../../components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', data);
      setAuth(res.data.data.user, res.data.data.accessToken);

      const role = res.data.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'restaurant_owner') navigate('/merchant/dashboard');
      else navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Invalid email or password. Please check your credentials.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-white/10 glass-panel shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 shadow-lg shadow-primary/30">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-black text-foreground">
              Khana<span className="text-primary">Now</span>
            </span>
          </Link>

          <h2 className="text-2xl font-extrabold text-foreground">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">
            Sign in to access your orders, express checkout, and saved addresses.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            placeholder="you@example.com"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          <div className="flex items-center justify-between pt-1 text-xs">
            <Checkbox
              label="Remember me"
              checked={form.watch('rememberMe')}
              onChange={(e) => form.setValue('rememberMe', e.target.checked)}
            />

            <Link
              to="/forgot-password"
              className="font-bold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full font-extrabold text-base h-12 shadow-lg shadow-primary/30 mt-2"
          >
            Sign In <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Google OAuth UI Placeholder */}
        <div className="space-y-4 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => alert('Google Sign-In integration placeholder')}
            className="w-full font-bold h-11 gap-2.5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};
