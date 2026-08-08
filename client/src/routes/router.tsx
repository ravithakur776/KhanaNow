import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { CheckoutLayout } from '../layouts/CheckoutLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { GuestRoute } from './GuestRoute';

import { LandingPage } from '../pages/public/LandingPage';
import { HomePage } from '../pages/customer/HomePage';
import { SearchPage } from '../pages/public/SearchPage';
import { RestaurantDetailPage } from '../pages/public/RestaurantDetailPage';
import { CartPage } from '../pages/customer/CartPage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

import { FavoritesPage } from '../pages/customer/FavoritesPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderSuccessPage } from '../pages/customer/OrderSuccessPage';
import { OrderTrackingPage } from '../pages/customer/OrderTrackingPage';
import { OrderHistoryPage } from '../pages/customer/OrderHistoryPage';
import { RestaurantDashboard } from '../pages/restaurant-owner/RestaurantDashboard';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { PaymentSuccessPage } from '../pages/customer/PaymentSuccessPage';
import { PaymentFailedPage } from '../pages/customer/PaymentFailedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

import { OrderDetailsPage } from '../pages/customer/OrderDetailsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'restaurant/:id', element: <RestaurantDetailPage /> },
      { path: 'payment/failed', element: <PaymentFailedPage /> },

      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          { path: 'verify-email', element: <VerifyEmailPage /> },
        ],
      },

      { path: 'unauthorized', element: <UnauthorizedPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'favorites', element: <FavoritesPage /> },
          { path: 'orders', element: <OrderHistoryPage /> },
          { path: 'orders/:orderNumber', element: <OrderDetailsPage /> },
          { path: 'orders/:orderId/track', element: <OrderTrackingPage /> },
          { path: 'payment/success', element: <PaymentSuccessPage /> },
          { path: 'order-success/:orderId', element: <OrderSuccessPage /> },
          { path: 'track-order/:orderId', element: <OrderTrackingPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/checkout',
    element: <ProtectedRoute />,
    children: [
      {
        element: <CheckoutLayout />,
        children: [{ index: true, element: <CheckoutPage /> }],
      },
    ],
  },
  {
    path: '/merchant',
    element: <RoleGuard allowedRoles={['restaurant_owner', 'admin']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ path: 'dashboard', element: <RestaurantDashboard /> }],
      },
    ],
  },
  {
    path: '/admin',
    element: <RoleGuard allowedRoles={['admin']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ path: 'dashboard', element: <AdminDashboardPage /> }],
      },
    ],
  },
]);
