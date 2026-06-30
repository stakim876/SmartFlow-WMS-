import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { InventoryItem, LocationOption } from '@/features/inventory/api/inventory';
import { COMMON, ERRORS, FORMAT, INVENTORY } from '@/shared/constants/labels';
import styles from './TransferInventoryModal.module.css';

interface TransferInventoryModalProps {
  inventory: InventoryItem;
  locations: LocationOption[];
  onClose: () => void;
  onSave: (input: {
    inventoryId: string;
    toLocationId: string;
    quantity: number;
    note?: string;
  }) => Promise<void>;
}

export function TransferInventoryModal({
  inventory,
  locations,
  onClose,
  onSave,
}: TransferInventoryModalProps) {
  const [toLocationId, setToLocationId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableLocations = locations.filter((loc) => loc.id !== inventory.location.id);

  useEffect(() => {
    if (availableLocations.length > 0 && !toLocationId) {
      setToLocationId(availableLocations[0].id);
    }
  }, [availableLocations, toLocationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        inventoryId: inventory.id,
        toLocationId,
        quantity,
        note: note || undefined,
      });
    } catch {
      setError(ERRORS.transferFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{INVENTORY.transferTitle}</h2>
        <p className={styles.info}>
          {FORMAT.skuName(inventory.product.sku, inventory.product.name)}
          <br />
          {INVENTORY.fromLabel}: {inventory.location.warehouse.name} / {inventory.location.code} (
          {INVENTORY.stockLabel} {inventory.quantity}
          {inventory.product.unit})
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {availableLocations.length === 0 ? (
            <p className={styles.error}>{INVENTORY.noTransferTarget}</p>
          ) : (
            <>
              <label className={styles.label}>
                {INVENTORY.toLocation}
                <select
                  value={toLocationId}
                  onChange={(e) => setToLocationId(e.target.value)}
                  className={styles.select}
                  required
                >
                  {availableLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                {INVENTORY.transferQty}
                <input
                  type="number"
                  min={1}
                  max={inventory.quantity}
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
                  placeholder={INVENTORY.transferNoteOptional}
                />
              </label>
              <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onClose}>
                  {COMMON.cancel}
                </Button>
                <Button type="submit" loading={loading} disabled={availableLocations.length === 0}>
                  {COMMON.transfer}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
