import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { InventoryPage } from '@/features/inventory/pages/InventoryPage';
import { WarehousesPage } from '@/features/warehouses/pages/WarehousesPage';
import { InboundPage } from '@/features/inbound/pages/InboundPage';
import { OutboundPage } from '@/features/outbound/pages/OutboundPage';
import { PartnersPage } from '@/features/partners/pages/PartnersPage';
import { PurchaseOrdersPage } from '@/features/purchase-orders/pages/PurchaseOrdersPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';
import { NoticesPage } from '@/features/notices/pages/NoticesPage';
import { ShopIntegrationPage } from '@/features/shop-integration/pages/ShopIntegrationPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { useAuthStore } from '@/features/auth/stores/authStore';

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'warehouses', element: <WarehousesPage /> },
          { path: 'inbound', element: <InboundPage /> },
          { path: 'outbound', element: <OutboundPage /> },
          { path: 'partners', element: <PartnersPage /> },
          { path: 'purchase-orders', element: <PurchaseOrdersPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'notices', element: <NoticesPage /> },
          { path: 'shop-integration', element: <ShopIntegrationPage /> },
        ],
      },
    ],
  },
]);
