import React from 'react';
import { cn } from '../../utils/cn';

interface CategoryPillProps {
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  icon,
  count,
  isActive = false,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 focus-ring whitespace-nowrap',
        isActive
          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
          : 'border border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-card',
        className
      )}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
            isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
