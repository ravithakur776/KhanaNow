import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { OTPInput } from '../../components/ui/otp-input';
import { Card } from '../../components/ui/card';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';

const passwordComplexitySchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain 1 uppercase letter')
  .regex(/[a-z]/, 'Must contain 1 lowercase letter')
  .regex(/[0-9]/, 'Must contain 1 number')
  .regex(/[^A-Za-z0-9]/, 'Must contain 1 special character');

const schema = z.object({
  email: z.string().email('Valid email address required'),
  otp: z.string().min(6, 'Valid 6-digit OTP required'),
  newPassword: passwordComplexitySchema,
});

type FormData = z.infer<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = searchParams.get('email') || '';

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialEmail,
      otp: '',
      newPassword: '',
    },
  });

  const watchPassword = form.watch('newPassword') || '';

  const onSubmit = async (data: FormData) => {
    setMessage('');
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/reset-password', data);
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 py-8">
      <Card className="w-full max-w-md p-8 border-white/10 glass-panel shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Set New Password</h2>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit OTP code sent to your email and your new password.
          </p>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400 text-center">
            {message}
          </div>
        )}

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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
              Enter 6-Digit OTP Code
            </label>
            <OTPInput
              value={form.watch('otp')}
              onChange={(otp) => form.setValue('otp', otp)}
            />
            {form.formState.errors.otp && (
              <p className="text-xs font-medium text-destructive text-center">
                {form.formState.errors.otp.message}
              </p>
            )}
          </div>

          <PasswordInput
            label="New Password"
            placeholder="••••••••"
            error={form.formState.errors.newPassword?.message}
            {...form.register('newPassword')}
          />

          {watchPassword && <PasswordStrengthMeter password={watchPassword} />}

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full font-extrabold text-base h-12 shadow-lg shadow-primary/30 mt-2"
          >
            Update Password <CheckCircle2 className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <Link to="/login" className="text-xs font-bold text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
