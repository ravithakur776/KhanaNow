import React from 'react';
import { cn } from '../../utils/cn';

interface PriceDisplayProps {
  amount: number;
  discountedAmount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  discountedAmount,
  size = 'md',
  className,
}) => {
  const hasDiscount = discountedAmount !== undefined && discountedAmount < amount;
  const displayAmount = hasDiscount ? discountedAmount : amount;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-extrabold tracking-tight',
  }[size];

  return (
    <div className={cn('inline-flex items-baseline gap-1.5 font-mono', className)}>
      <span className={cn('text-foreground', sizeClasses)}>
        ₹{displayAmount.toLocaleString('en-IN')}
      </span>
      {hasDiscount && (
        <span className="text-xs text-muted-foreground line-through decoration-destructive/60">
          ₹{amount.toLocaleString('en-IN')}
        </span>
      )}
    </div>
  );
};
