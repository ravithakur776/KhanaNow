import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'info',
  onClose,
}) => {
  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-primary shrink-0" />,
  };

  const borderMap = {
    success: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100',
    error: 'border-rose-500/30 bg-rose-950/20 text-rose-100',
    warning: 'border-amber-500/30 bg-amber-950/20 text-amber-100',
    info: 'border-primary/30 bg-card text-foreground',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border p-4 shadow-2xl glass-panel animate-in slide-in-from-top-4 duration-300 max-w-sm w-full',
        borderMap[variant]
      )}
      role="alert"
    >
      {iconMap[variant]}
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-bold truncate">{title}</h5>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-lg"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
