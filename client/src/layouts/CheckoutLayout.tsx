import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Lock } from 'lucide-react';

export const CheckoutLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Minimal high-conversion checkout header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-black">
              Khana<span className="text-primary">Now</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> 256-Bit Encrypted Secure Checkout
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
};
