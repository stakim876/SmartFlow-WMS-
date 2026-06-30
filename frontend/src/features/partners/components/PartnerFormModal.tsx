import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { Partner, PartnerInput } from '@/features/partners/api/partners';
import { COMMON, ERRORS, PARTNER_TYPE, PARTNERS } from '@/shared/constants/labels';
import styles from './PartnerFormModal.module.css';

interface PartnerFormModalProps {
  partner: Partner | null;
  onClose: () => void;
  onSave: (input: PartnerInput) => Promise<void>;
}

const emptyForm: PartnerInput = {
  code: '',
  name: '',
  type: 'SUPPLIER',
  contactName: '',
  phone: '',
  email: '',
  address: '',
};

export function PartnerFormModal({ partner, onClose, onSave }: PartnerFormModalProps) {
  const [form, setForm] = useState<PartnerInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (partner) {
      setForm({
        code: partner.code,
        name: partner.name,
        type: partner.type,
        contactName: partner.contactName ?? '',
        phone: partner.phone ?? '',
        email: partner.email ?? '',
        address: partner.address ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [partner]);

  const handleChange = (field: keyof PartnerInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        ...form,
        contactName: form.contactName || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
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
        <h2 className={styles.title}>{partner ? PARTNERS.editTitle : PARTNERS.addTitle}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.row}>
            <label className={styles.label}>
              {COMMON.partnerCode}
              <input
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              {COMMON.partnerType}
              <select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={styles.input}
                required
              >
                {Object.entries(PARTNER_TYPE).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={styles.label}>
            {COMMON.partnerName}
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={styles.input}
              required
            />
          </label>
          <div className={styles.row}>
            <label className={styles.label}>
              {COMMON.contactName}
              <input
                value={form.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                className={styles.input}
              />
            </label>
            <label className={styles.label}>
              {COMMON.phone}
              <input
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={styles.input}
              />
            </label>
          </div>
          <label className={styles.label}>
            {COMMON.email}
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            {COMMON.address}
            <input
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
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
