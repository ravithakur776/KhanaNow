import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { CheckoutLayout } from '../layouts/CheckoutLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

import { LandingPage } from '../pages/public/LandingPage';
import { SearchPage } from '../pages/public/SearchPage';
import { RestaurantDetailPage } from '../pages/public/RestaurantDetailPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderSuccessPage } from '../pages/customer/OrderSuccessPage';
import { OrderTrackingPage } from '../pages/customer/OrderTrackingPage';
import { OrderHistoryPage } from '../pages/customer/OrderHistoryPage';
import { RestaurantDashboard } from '../pages/restaurant-owner/RestaurantDashboard';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'restaurant/:id', element: <RestaurantDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'orders', element: <OrderHistoryPage /> },
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
