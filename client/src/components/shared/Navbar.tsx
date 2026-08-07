import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  MapPin,
  Search,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { Button } from '../ui/button';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { openCartDrawer, openAuthModal, openLocationDrawer } = useUIStore();
  const currentLocation = useLocationStore((state) => state.currentLocation);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo & Geolocation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                Khana<span className="text-primary">Now</span>
              </span>
              <span className="hidden sm:block text-[10px] font-bold tracking-widest text-primary uppercase -mt-1">
                Fast & Premium
              </span>
            </div>
          </Link>

          {/* Location Picker Pill */}
          <button
            type="button"
            onClick={openLocationDrawer}
            className="hidden md:flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-card transition-all"
          >
            <MapPin className="h-4 w-4 text-primary animate-bounce" />
            <div className="text-left">
              <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                Delivering To
              </span>
              <span className="block max-w-[140px] truncate font-bold text-foreground">
                {currentLocation.address}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          </button>
        </div>

        {/* Global Search Bar (Trigger) */}
        <div className="flex-1 max-w-md hidden lg:block">
          <Link
            to="/search"
            className="flex items-center gap-3 w-full rounded-2xl border border-border bg-card/40 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:bg-card transition-all"
          >
            <Search className="h-4 w-4 text-primary" />
            <span>Search for biryani, pizza, burgers, or restaurants...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Link>
        </div>

        {/* Action Controls (Search Icon Mobile, Cart, User Menu) */}
        <div className="flex items-center gap-3">
          <Link to="/search" className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-5 w-5 text-foreground" />
            </Button>
          </Link>

          {/* Cart Drawer Trigger Button */}
          <Button
            variant="glass"
            onClick={openCartDrawer}
            className="relative gap-2 font-bold hover:border-primary/50"
          >
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white animate-pulse">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Auth State Control */}
          {isAuthenticated && user ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 pr-3 hover:border-primary/40 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-semibold max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 glass-panel rounded-2xl p-2 shadow-2xl z-50">
                <div className="px-3 py-2 border-b border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/orders"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-primary" /> My Orders
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-amber-400" /> Account Profile
                  </Link>

                  {user.role === 'restaurant_owner' && (
                    <Link
                      to="/merchant/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-white/5 text-emerald-400 transition-colors"
                    >
                      <Store className="h-4 w-4" /> Merchant Portal
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl hover:bg-white/5 text-purple-400 transition-colors"
                    >
                      <Shield className="h-4 w-4" /> Admin Console
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={() => openAuthModal('login')} variant="default" className="font-bold">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
