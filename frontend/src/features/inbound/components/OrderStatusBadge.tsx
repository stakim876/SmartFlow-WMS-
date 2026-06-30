import { OrderStatus } from '@/features/inbound/api/inbound';
import { ORDER_STATUS } from '@/shared/constants/labels';
import styles from './OrderStatusBadge.module.css';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>{ORDER_STATUS[status] ?? status}</span>
  );
}
