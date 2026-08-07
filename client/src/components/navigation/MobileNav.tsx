import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, Heart, User as UserIcon } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../utils/cn';

export const MobileNav: React.FC = () => {
  const itemCount = useCartStore((state) => state.getItemCount());
  const { openCartDrawer, openAuthModal } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 bg-background/90 backdrop-blur-xl px-4 py-2">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 text-[10px] font-bold transition-colors py-1 px-3 rounded-xl',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 text-[10px] font-bold transition-colors py-1 px-3 rounded-xl',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </NavLink>

        {/* Cart Trigger */}
        <button
          type="button"
          onClick={openCartDrawer}
          className="relative flex flex-col items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary py-1 px-3 rounded-xl transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                {itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 text-[10px] font-bold transition-colors py-1 px-3 rounded-xl',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Heart className="h-5 w-5" />
          <span>Orders</span>
        </NavLink>

        {/* Account / Auth Trigger */}
        {isAuthenticated ? (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 text-[10px] font-bold transition-colors py-1 px-3 rounded-xl',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <UserIcon className="h-5 w-5" />
            <span>Profile</span>
          </NavLink>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground py-1 px-3 rounded-xl"
          >
            <UserIcon className="h-5 w-5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
