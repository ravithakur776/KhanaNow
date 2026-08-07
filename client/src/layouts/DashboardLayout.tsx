import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Store,
  Menu as MenuIcon,
  BarChart3,
  Ticket,
  Shield,
  LogOut,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isMerchant = user?.role === 'restaurant_owner';

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card/60 flex flex-col p-4 shrink-0">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 px-3 py-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-amber-500 shadow-md">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display text-xl font-bold">KhanaNow</span>
            <span className="block text-[10px] font-extrabold uppercase text-primary tracking-widest">
              {isAdmin ? 'Admin Console' : 'Merchant Portal'}
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5 flex-1">
          {isMerchant && (
            <>
              <Link
                to="/merchant/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/merchant/dashboard'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> Live Orders
              </Link>

              <Link
                to="/merchant/menu"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/merchant/menu'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <MenuIcon className="h-4 w-4" /> Menu Manager
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> Overview
              </Link>

              <Link
                to="/admin/analytics"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/admin/analytics'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-4 w-4" /> Sales Analytics
              </Link>

              <Link
                to="/admin/restaurants"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/admin/restaurants'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <Store className="h-4 w-4" /> Merchant Approvals
              </Link>

              <Link
                to="/admin/coupons"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === '/admin/coupons'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <Ticket className="h-4 w-4" /> Coupon Manager
              </Link>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-border pt-4 mt-auto">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="truncate">
              <p className="text-xs font-bold truncate text-foreground">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">{user?.role}</p>
            </div>
            <button
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive p-1 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/40 flex items-center justify-between px-8">
          <h2 className="text-lg font-bold text-foreground">
            {isAdmin ? 'System Administration Console' : 'Restaurant Management Portal'}
          </h2>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
