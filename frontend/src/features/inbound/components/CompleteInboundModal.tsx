import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { fetchLocations, LocationOption } from '@/features/inventory/api/inventory';
import { OrderItem } from '@/features/inbound/api/inbound';
import { COMMON, ERRORS, INBOUND } from '@/shared/constants/labels';
import styles from './CompleteInboundModal.module.css';

interface CompleteInboundModalProps {
  orderNo: string;
  items: OrderItem[];
  onClose: () => void;
  onComplete: (items: { itemId: string; locationId: string }[]) => Promise<void>;
}

export function CompleteInboundModal({
  orderNo,
  items,
  onClose,
  onComplete,
}: CompleteInboundModalProps) {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations().then(setLocations);
    const initial: Record<string, string> = {};
    items.forEach((item) => {
      if (item.locationId) initial[item.id] = item.locationId;
    });
    setSelections(initial);
  }, [items]);

  const canSubmit = items.every((item) => item.locationId || selections[item.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = items.map((item) => ({
        itemId: item.id,
        locationId: selections[item.id] || item.locationId!,
      }));
      await onComplete(payload);
    } catch {
      setError(ERRORS.completeFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {INBOUND.completeTitle} - {orderNo}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <strong>{item.product.name}</strong>
                <span>
                  {item.quantity} {item.product.unit}
                </span>
              </div>
              {!item.locationId && (
                <select
                  value={selections[item.id] ?? ''}
                  onChange={(e) =>
                    setSelections((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  className={styles.input}
                  required
                >
                  <option value="">{INBOUND.selectLocation}</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              )}
              {item.locationId && (
                <span className={styles.assigned}>{INBOUND.locationAssigned}</span>
              )}
            </div>
          ))}
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {COMMON.cancel}
            </Button>
            <Button type="submit" loading={loading} disabled={!canSubmit}>
              {INBOUND.completeAction}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
