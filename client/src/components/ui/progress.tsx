import * as React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number; // 0 - 100
  max?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  showPercentage = false,
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5',
  }[size];

  return (
    <div className="w-full space-y-1">
      {showPercentage && (
        <div className="flex justify-between text-xs font-bold text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-muted',
          heightClass,
          className
        )}
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
