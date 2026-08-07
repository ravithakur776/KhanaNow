import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RotateCcw } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Button } from '../../components/ui/button';
import { OTPInput } from '../../components/ui/otp-input';
import { Card } from '../../components/ui/card';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/auth/verify-email', { email, otp });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    try {
      const res = await apiClient.post('/auth/resend-verification', { email });
      setMessage(res.data.message);
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to resend verification OTP.');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-white/10 glass-panel shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Verify Email Address</h2>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit OTP code sent to{' '}
            <span className="font-bold text-foreground">{email || 'your email'}</span>.
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

        <form onSubmit={handleVerify} className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} />

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={otp.length < 6}
            size="lg"
            className="w-full font-extrabold text-base h-12 shadow-lg shadow-primary/30"
          >
            Verify Email <CheckCircle2 className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 pt-2 text-xs text-muted-foreground">
          <p>Didn't receive the OTP code?</p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0}
            className="font-bold text-primary hover:underline disabled:opacity-50 inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP Code'}
          </button>
        </div>

        <div className="border-t border-border pt-4 text-center">
          <Link to="/login" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
