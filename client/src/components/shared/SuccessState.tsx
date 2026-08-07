import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

interface SuccessStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-emerald-500/30 bg-emerald-500/5 my-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-bounce">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h4 className="text-xl font-bold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="veg" className="font-extrabold px-6 shadow-md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
