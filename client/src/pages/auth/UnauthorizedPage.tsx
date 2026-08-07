import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 animate-pulse">
        <ShieldAlert className="h-10 w-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
          403 Access Denied
        </span>
        <h1 className="text-3xl font-extrabold text-foreground">Unauthorized Access</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You do not have the required permissions or role privileges to view this portal.
        </p>
      </div>

      <div className="flex gap-4">
        <Link to="/">
          <Button size="lg" className="font-bold gap-2">
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
