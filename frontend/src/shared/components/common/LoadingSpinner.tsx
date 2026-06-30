import styles from './LoadingSpinner.module.css';
import { COMMON } from '@/shared/constants/labels';

export function LoadingSpinner() {
  return (
    <div className={styles.wrapper} role="status" aria-label={COMMON.loadingLabel}>
      <div className={styles.spinner} />
    </div>
  );
}
