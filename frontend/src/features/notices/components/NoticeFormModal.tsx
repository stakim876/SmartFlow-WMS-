import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { Notice, NoticeInput } from '@/features/notices/api/notices';
import { COMMON, ERRORS, NOTICES } from '@/shared/constants/labels';
import styles from './NoticeFormModal.module.css';

interface NoticeFormModalProps {
  notice: Notice | null;
  onClose: () => void;
  onSave: (input: NoticeInput) => Promise<void>;
}

const emptyForm: NoticeInput = {
  title: '',
  content: '',
  isPinned: false,
};

export function NoticeFormModal({ notice, onClose, onSave }: NoticeFormModalProps) {
  const [form, setForm] = useState<NoticeInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (notice) {
      setForm({
        title: notice.title,
        content: notice.content,
        isPinned: notice.isPinned,
      });
    } else {
      setForm(emptyForm);
    }
  }, [notice]);

  const handleChange = (field: keyof NoticeInput, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(form);
    } catch {
      setError(ERRORS.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{notice ? NOTICES.editTitle : NOTICES.addTitle}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {NOTICES.title}
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={styles.input}
              required
              maxLength={200}
            />
          </label>
          <label className={styles.label}>
            {NOTICES.content}
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              className={styles.textarea}
              required
              rows={8}
              maxLength={10000}
            />
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.isPinned ?? false}
              onChange={(e) => handleChange('isPinned', e.target.checked)}
            />
            {NOTICES.pinned}
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
