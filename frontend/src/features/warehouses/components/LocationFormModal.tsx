import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { Location, LocationInput } from '@/features/warehouses/api/warehouses';
import { COMMON, ERRORS, WAREHOUSES } from '@/shared/constants/labels';
import styles from './WarehouseFormModal.module.css';

interface LocationFormModalProps {
  location: Location | null;
  onClose: () => void;
  onSave: (input: LocationInput) => Promise<void>;
}

const emptyForm: LocationInput = {
  code: '',
  name: '',
};

export function LocationFormModal({ location, onClose, onSave }: LocationFormModalProps) {
  const [form, setForm] = useState<LocationInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location) {
      setForm({
        code: location.code,
        name: location.name ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        ...form,
        name: form.name || undefined,
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
          {location ? WAREHOUSES.editLocationTitle : WAREHOUSES.addLocationTitle}
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {COMMON.locationCode}
            <input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            {COMMON.locationName}
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className={styles.input}
              placeholder="예: A구역 1열 1단"
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
