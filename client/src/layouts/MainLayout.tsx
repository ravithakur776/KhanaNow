import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { MobileNav } from '../components/navigation/MobileNav';
import { CartDrawer } from '../features/cart/CartDrawer';
import { AuthModal } from '../features/auth/AuthModal';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <AuthModal />
    </div>
  );
};
