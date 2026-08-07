import * as React from 'react';
import { cn } from '../../utils/cn';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const otpArr = value.split('');
    otpArr[index] = val;
    const newOtp = otpArr.join('');
    onChange(newOtp);

    // Auto-advance to next input
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          className={cn(
            'h-12 w-12 rounded-xl border border-border bg-card/80 text-center text-lg font-mono font-bold text-foreground transition-all duration-200 focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/30',
            value[idx] && 'border-primary bg-primary/10'
          )}
        />
      ))}
    </div>
  );
};
