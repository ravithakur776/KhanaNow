import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
        <UtensilsCrossed className="h-12 w-12" />
      </div>
      <h1 className="text-6xl font-black text-foreground">404</h1>
      <h2 className="text-2xl font-bold text-foreground">Oops! Page lost in delivery</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        The dish or page you are looking for has been eaten or removed. Let's get you back to delicious food!
      </p>
      <RouterLink to="/">
        <Button size="lg" className="font-bold gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </RouterLink>
    </div>
  );
};
