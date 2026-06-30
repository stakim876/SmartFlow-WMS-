import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { useEffect, useState } from 'react';
import { getProfile } from '@/features/auth/api/auth';

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(isAuthenticated && !user);

  useEffect(() => {
    if (!isAuthenticated || user) {
      setLoading(false);
      return;
    }

    getProfile()
      .then(setUser)
      .catch(() => {
        useAuthStore.getState().logout();
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, setUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return <Outlet />;
}
