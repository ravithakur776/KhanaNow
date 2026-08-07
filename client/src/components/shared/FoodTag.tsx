import React from 'react';
import { cn } from '../../utils/cn';

interface FoodTagProps {
  type: 'veg' | 'non-veg' | 'egg';
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const FoodTag: React.FC<FoodTagProps> = ({
  type,
  showLabel = false,
  size = 'md',
  className,
}) => {
  const isVeg = type === 'veg';
  const isEgg = type === 'egg';

  const borderColor = isVeg
    ? 'border-emerald-500'
    : isEgg
    ? 'border-amber-500'
    : 'border-rose-500';

  const fillColor = isVeg
    ? 'bg-emerald-500'
    : isEgg
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const boxSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const symbolSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-sm border-2 p-0.5 bg-background/80 shrink-0',
          borderColor,
          boxSize
        )}
        title={type.toUpperCase()}
      >
        <div className={cn('rounded-full', fillColor, symbolSize)} />
      </div>
      {showLabel && (
        <span className="text-xs font-bold capitalize text-foreground">
          {type}
        </span>
      )}
    </div>
  );
};
