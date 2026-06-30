import { useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { User } from '@/features/users/api/users';
import { AUTH, COMMON, USERS } from '@/shared/constants/labels';
import styles from './UserFormModal.module.css';

interface ResetPasswordModalProps {
  user: User;
  onClose: () => void;
  onSave: (password: string) => Promise<void>;
}

export function ResetPasswordModal({ user, onClose, onSave }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave(password);
    } catch {
      setError(USERS.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{USERS.resetPasswordTitle}</h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {user.name} ({user.email})
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {USERS.newPassword}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder={AUTH.passwordPlaceholder}
              minLength={8}
              required
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
