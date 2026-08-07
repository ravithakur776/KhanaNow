import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const rules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'At least one special character (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = rules.filter((r) => r.valid).length;
  const strengthPercentage = (passedCount / rules.length) * 100;

  const strengthColor =
    passedCount <= 2
      ? 'bg-rose-500'
      : passedCount <= 4
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const strengthLabel =
    passedCount <= 2
      ? 'Weak Password'
      : passedCount <= 4
      ? 'Medium Strength'
      : 'Strong Password';

  return (
    <div className="space-y-3 p-4 rounded-2xl border border-border bg-card/40 text-xs">
      <div className="flex justify-between items-center font-bold">
        <span className="text-muted-foreground uppercase text-[10px] tracking-wider">
          Password Strength
        </span>
        <span
          className={cn(
            'text-[11px]',
            passedCount <= 2 ? 'text-rose-400' : passedCount <= 4 ? 'text-amber-400' : 'text-emerald-400'
          )}
        >
          {strengthLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', strengthColor)}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>

      {/* Live Checklist */}
      <div className="space-y-1.5 pt-1">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-center gap-2 text-[11px] font-medium transition-colors',
              rule.valid ? 'text-emerald-400 font-semibold' : 'text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0',
                rule.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted text-muted-foreground'
              )}
            >
              {rule.valid ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <X className="h-2.5 w-2.5" />}
            </div>
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
