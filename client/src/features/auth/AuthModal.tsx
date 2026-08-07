import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, UtensilsCrossed, Mail, Lock, User as UserIcon, Phone, ShieldCheck } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Valid 10-digit phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'restaurant_owner', 'delivery_partner']),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalView, openAuthModal } = useUIStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = authModalView === 'login';

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', role: 'customer' },
  });

  if (!isAuthModalOpen) return null;

  const onLoginSubmit = async (data: LoginFormData) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', data);
      setAuth(res.data.data.user, res.data.data.accessToken);
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', data);
      setAuth(res.data.data.user, res.data.data.accessToken);
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl glass-panel border border-white/10 bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 shadow-lg shadow-primary/30 mb-3">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-foreground">
            {isLogin ? 'Welcome Back!' : 'Join KhanaNow'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isLogin
              ? 'Sign in to access your orders, saved addresses, and recommendations.'
              : 'Create an account for express 30-min food delivery.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive text-center">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register('email')}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={loginForm.formState.errors.password?.message}
              {...loginForm.register('password')}
            />

            <Button type="submit" isLoading={isLoading} className="w-full font-bold h-12 text-base">
              Sign In
            </Button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={<UserIcon className="h-4 w-4" />}
              error={registerForm.formState.errors.name?.message}
              {...registerForm.register('name')}
            />

            <Input
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              error={registerForm.formState.errors.email?.message}
              {...registerForm.register('email')}
            />

            <Input
              label="Phone Number"
              placeholder="9876543210"
              icon={<Phone className="h-4 w-4" />}
              error={registerForm.formState.errors.phone?.message}
              {...registerForm.register('phone')}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={registerForm.formState.errors.password?.message}
              {...registerForm.register('password')}
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Type
              </label>
              <select
                {...registerForm.register('role')}
                className="w-full h-11 rounded-xl border border-border bg-card/60 px-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
              >
                <option value="customer">Customer (Order Food)</option>
                <option value="restaurant_owner">Restaurant Owner / Merchant</option>
                <option value="delivery_partner">Delivery Partner</option>
              </select>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full font-bold h-12 text-base mt-2">
              Create Account
            </Button>
          </form>
        )}

        {/* View Switcher Toggle */}
        <div className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="font-bold text-primary hover:underline"
              >
                Sign up now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
