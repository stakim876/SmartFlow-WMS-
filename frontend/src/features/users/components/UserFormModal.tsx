import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/common/Button';
import { Role, User, CreateUserInput, UpdateUserInput } from '@/features/users/api/users';
import { COMMON, ROLE_LABELS, USERS } from '@/shared/constants/labels';
import styles from './UserFormModal.module.css';

interface UserFormModalProps {
  user: User | null;
  roles: Role[];
  onClose: () => void;
  onSave: (input: CreateUserInput | UpdateUserInput) => Promise<void>;
}

export function UserFormModal({ user, roles, onClose, onSave }: UserFormModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
      setRoleId(user.role.id);
      setPassword('');
    } else {
      setEmail('');
      setName('');
      setPassword('');
      setRoleId(roles[0]?.id ?? '');
    }
  }, [user, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (user) {
        await onSave({ name, roleId });
      } else {
        await onSave({ email, password, name, roleId });
      }
    } catch {
      setError(USERS.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{user ? USERS.editTitle : USERS.addTitle}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.label}>
            {COMMON.email}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              disabled={!!user}
            />
          </label>
          {!user && (
            <label className={styles.label}>
              {COMMON.password}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                minLength={8}
                required
              />
            </label>
          )}
          <label className={styles.label}>
            {COMMON.userName}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
              minLength={2}
            />
          </label>
          <label className={styles.label}>
            {USERS.role}
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className={styles.input}
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {ROLE_LABELS[role.name] ?? role.name}
                </option>
              ))}
            </select>
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
