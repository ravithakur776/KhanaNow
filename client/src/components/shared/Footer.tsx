import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, ShieldCheck, Zap, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card/40 pt-16 pb-12 mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 shadow-md">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-2xl font-black text-foreground">
                Khana<span className="text-primary">Now</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Food delivered smarter, faster, and better. Bringing your favorite culinary delights right to your doorstep with AI efficiency.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Discover</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/search" className="hover:text-primary transition-colors">Trending Restaurants</Link></li>
              <li><Link to="/search?veg=true" className="hover:text-primary transition-colors">Pure Veg Delights</Link></li>
              <li><Link to="/favorites" className="hover:text-primary transition-colors">Popular Cuisines</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Track Active Orders</Link></li>
            </ul>
          </div>

          {/* Business & Partners */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">For Partners</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/merchant/dashboard" className="hover:text-primary transition-colors">Partner With Us</Link></li>
              <li><Link to="/merchant/menu" className="hover:text-primary transition-colors">Merchant Portal</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-primary transition-colors">System Admin</Link></li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">KhanaNow Promise</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> 30-Minute Guaranteed Express Delivery
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> FSSAI Certified Hygienic Kitchens
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-amber-400" /> 24/7 AI-Powered Support Assistant
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} KhanaNow Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="h-3.5 w-3.5 text-destructive fill-current" /> for food lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
