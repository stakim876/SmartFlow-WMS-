import { useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { InventoryItem } from '@/features/inventory/api/inventory';
import { COMMON, ERRORS, FORMAT, INVENTORY } from '@/shared/constants/labels';
import styles from './AdjustInventoryModal.module.css';

interface AdjustInventoryModalProps {
  inventory: InventoryItem;
  onClose: () => void;
  onSave: (quantity: number, note?: string) => Promise<void>;
}

export function AdjustInventoryModal({ inventory, onClose, onSave }: AdjustInventoryModalProps) {
  const [quantity, setQuantity] = useState(inventory.quantity);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(quantity, note || undefined);
    } catch {
      setError(ERRORS.adjustFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{INVENTORY.adjustTitle}</h2>
        <p className={styles.info}>
          {FORMAT.skuName(inventory.product.sku, inventory.product.name)}
          <br />
          {inventory.location.warehouse.name} / {inventory.location.code}
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {INVENTORY.currentQty}
            <input value={inventory.quantity} className={styles.input} disabled />
          </label>
          <label className={styles.label}>
            {INVENTORY.newQty}
            <input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            {COMMON.note}
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.input}
              placeholder={INVENTORY.noteOptional}
            />
          </label>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              {COMMON.cancel}
            </Button>
            <Button type="submit" loading={loading}>
              {COMMON.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
