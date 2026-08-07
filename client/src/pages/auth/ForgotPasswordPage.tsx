import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, ArrowLeft, Send } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';

const schema = z.object({
  email: z.string().email('Valid email address required'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setMessage('');
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', data);
      setMessage(res.data.message);
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to send password reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-white/10 glass-panel shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Reset Password</h2>
          <p className="text-xs text-muted-foreground">
            Enter your registered email address and we will send a 6-digit OTP code to reset your password.
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

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full font-extrabold text-base h-12 shadow-lg shadow-primary/30"
          >
            Send OTP Code <Send className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
