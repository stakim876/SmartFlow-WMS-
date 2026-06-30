import { MovementType } from '@/features/inventory/api/inventory';
import styles from './MovementTypeBadge.module.css';

const labels: Record<MovementType, string> = {
  INBOUND: '입고',
  OUTBOUND: '출고',
  ADJUSTMENT: '조정',
  TRANSFER: '이동',
};

export function MovementTypeBadge({ type }: { type: MovementType }) {
  return <span className={`${styles.badge} ${styles[type]}`}>{labels[type]}</span>;
}
