import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Store,
  Shield,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';

export const UserDropdown: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  if (!user) return null;

  return (
    <div className="w-64 glass-panel rounded-2xl p-2 shadow-2xl space-y-1">
      {/* Header Profile Summary */}
      <div className="px-3 py-2.5 border-b border-border/60">
        <p className="text-xs font-semibold text-muted-foreground">Signed in as</p>
        <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
      </div>

      {/* Navigation Links */}
      <div className="py-1 space-y-0.5">
        <Link
          to="/orders"
          className="flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl hover:bg-white/5 transition-colors text-foreground"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" /> My Orders
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>

        <Link
          to="/profile"
          className="flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl hover:bg-white/5 transition-colors text-foreground"
        >
          <span className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-amber-400" /> Account Profile
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>

        {user.role === 'restaurant_owner' && (
          <Link
            to="/merchant/dashboard"
            className="flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl hover:bg-white/5 text-emerald-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4" /> Merchant Portal
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />
          </Link>
        )}

        {user.role === 'admin' && (
          <Link
            to="/admin/dashboard"
            className="flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl hover:bg-white/5 text-purple-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Admin Console
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-purple-400" />
          </Link>
        )}
      </div>

      {/* Theme Switcher Row */}
      <div className="border-t border-border/60 pt-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold rounded-xl hover:bg-white/5 transition-colors text-foreground"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-primary" />
            )}
            Theme: <span className="capitalize">{theme}</span>
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Toggle</span>
        </button>

        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-destructive hover:bg-destructive/10 transition-colors mt-1"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};
