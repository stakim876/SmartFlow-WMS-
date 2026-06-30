import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { logout as logoutApi } from '@/features/auth/api/auth';
import { Button } from '@/shared/components/common/Button';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { NotificationBell } from '@/shared/components/common/NotificationBell';
import { COMMON, ROLE_LABELS } from '@/shared/constants/labels';
import styles from './Header.module.css';
export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logoutApi(refreshToken ?? undefined);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const initials = (user?.name ?? COMMON.userFallback).slice(0, 1).toUpperCase();
  const roleLabel = user?.role.name ? (ROLE_LABELS[user.role.name] ?? user.role.name) : '-';

  return (
    <header className={styles.header}>
      <div className={styles.workspace}>
        <span className={styles.workspaceLabel}>Workspace</span>
        <h2 className={styles.workspaceTitle}>SmartFlow WMS</h2>
      </div>
      <div className={styles.actions}>
        <NotificationBell />
        <ThemeToggle />
        <div className={styles.userCard}>          <span className={styles.avatar}>{initials}</span>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user?.name ?? COMMON.userFallback}</span>
            <span className={styles.userRole}>{roleLabel}</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          {COMMON.logout}
        </Button>
      </div>
    </header>
  );
}
