import * as React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  label?: string;
  variant?: 'spinner' | 'dots' | 'brand';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  label,
  variant = 'spinner',
  className,
}) => {
  if (size === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-amber-500 shadow-2xl shadow-primary/40 animate-pulse">
          <UtensilsCrossed className="h-8 w-8 text-white animate-spin" />
        </div>
        {label && <p className="mt-4 text-sm font-bold text-foreground">{label}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('inline-flex items-center gap-1.5', className)}>
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
      </div>
    );
  }

  const sizeClass = {
    sm: 'h-4 w-4 stroke-[3]',
    md: 'h-6 w-6 stroke-[3]',
    lg: 'h-10 w-10 stroke-[2]',
  }[size];

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <svg
        className={cn('animate-spin text-primary', sizeClass)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && <span className="text-xs font-semibold text-muted-foreground">{label}</span>}
    </div>
  );
};
