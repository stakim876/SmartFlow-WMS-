import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { AUTH } from '@/shared/constants/labels';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.themeSlot}>
        <ThemeToggle />
      </div>      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>SF</div>
          <h1>SmartFlow WMS</h1>
          <p>{AUTH.tagline}</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
