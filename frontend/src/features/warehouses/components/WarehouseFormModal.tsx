import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { Warehouse, WarehouseInput } from '@/features/warehouses/api/warehouses';
import { COMMON, ERRORS, WAREHOUSES } from '@/shared/constants/labels';
import styles from './WarehouseFormModal.module.css';

interface WarehouseFormModalProps {
  warehouse: Warehouse | null;
  onClose: () => void;
  onSave: (input: WarehouseInput) => Promise<void>;
}

const emptyForm: WarehouseInput = {
  code: '',
  name: '',
  address: '',
};

export function WarehouseFormModal({ warehouse, onClose, onSave }: WarehouseFormModalProps) {
  const [form, setForm] = useState<WarehouseInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (warehouse) {
      setForm({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [warehouse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        ...form,
        address: form.address || undefined,
      });
    } catch {
      setError(ERRORS.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {warehouse ? WAREHOUSES.editWarehouseTitle : WAREHOUSES.addWarehouseTitle}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {COMMON.warehouseCode}
            <input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            {COMMON.warehouse}
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            {COMMON.address}
            <input
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              className={styles.input}
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
