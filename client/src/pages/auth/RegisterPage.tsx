import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UtensilsCrossed, Mail, User as UserIcon, Phone, UserCheck } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Checkbox } from '../../components/ui/checkbox';
import { Card } from '../../components/ui/card';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';

const passwordComplexitySchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
  .regex(/[a-z]/, 'Must contain at least 1 lowercase letter')
  .regex(/[0-9]/, 'Must contain at least 1 number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least 1 special character');

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email('Valid email address required'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Valid 10-digit phone required'),
    password: passwordComplexitySchema,
    confirmPassword: z.string(),
    role: z.enum(['customer', 'restaurant_owner', 'delivery_partner']),
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept Terms and Conditions'),
    newsletterOptIn: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      acceptTerms: false,
      newsletterOptIn: false,
    },
  });

  const watchPassword = form.watch('password') || '';

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', data);
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center p-4 py-8">
      <Card className="w-full max-w-lg p-8 border-white/10 glass-panel shadow-2xl space-y-6">
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

          <h2 className="text-2xl font-extrabold text-foreground">Create Your Account</h2>
          <p className="text-xs text-muted-foreground">
            Join KhanaNow for express 18-min food delivery, zero surge fees, and AI taste perks.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              icon={<UserIcon className="h-4 w-4" />}
              error={form.formState.errors.firstName?.message}
              {...form.register('firstName')}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              icon={<UserIcon className="h-4 w-4" />}
              error={form.formState.errors.lastName?.message}
              {...form.register('lastName')}
            />
          </div>

          <Input
            label="Email Address"
            placeholder="john@example.com"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <Input
            label="Phone Number"
            placeholder="9876543210"
            icon={<Phone className="h-4 w-4" />}
            error={form.formState.errors.phone?.message}
            {...form.register('phone')}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          {/* Live Password Strength Meter */}
          {watchPassword && <PasswordStrengthMeter password={watchPassword} />}

          <PasswordInput
            label="Confirm Password"
            placeholder="••••••••"
            error={form.formState.errors.confirmPassword?.message}
            {...form.register('confirmPassword')}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Type
            </label>
            <select
              {...form.register('role')}
              className="w-full h-11 rounded-xl border border-border bg-card/60 px-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="customer">Customer (Order Food)</option>
              <option value="restaurant_owner">Restaurant Owner / Merchant</option>
              <option value="delivery_partner">Delivery Executive</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <Checkbox
              label="I accept the Terms of Service & Privacy Policy"
              checked={form.watch('acceptTerms')}
              onChange={(e) => form.setValue('acceptTerms', e.target.checked)}
            />
            {form.formState.errors.acceptTerms && (
              <p className="text-xs font-semibold text-destructive">
                {form.formState.errors.acceptTerms.message}
              </p>
            )}

            <Checkbox
              label="Subscribe to exclusive foodie coupons & drop alerts"
              checked={form.watch('newsletterOptIn')}
              onChange={(e) => form.setValue('newsletterOptIn', e.target.checked)}
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full font-extrabold text-base h-12 shadow-lg shadow-primary/30 mt-2"
          >
            Create Account <UserCheck className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};
