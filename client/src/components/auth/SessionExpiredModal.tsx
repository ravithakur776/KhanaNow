import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { useUIStore } from '../../stores/useUIStore';

export const SessionExpiredModal: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useUIStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl glass-panel border border-white/10 bg-card p-6 shadow-2xl text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <Clock className="h-7 w-7 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">Session Expired</h3>
          <p className="text-xs text-muted-foreground">
            Your login session has expired for security reasons. Please sign in again to continue.
          </p>
        </div>

        <Button
          onClick={() => {
            openAuthModal('login');
            navigate('/');
          }}
          className="w-full font-extrabold gap-2 shadow-lg shadow-primary/30"
        >
          <LogIn className="h-4 w-4" /> Sign In Again
        </Button>
      </div>
    </div>
  );
};
