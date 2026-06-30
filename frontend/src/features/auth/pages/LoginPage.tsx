import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/common/Button';
import { login } from '@/features/auth/api/auth';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { AUTH, COMMON, ERRORS } from '@/shared/constants/labels';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('admin@smartflow.com');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate(from, { replace: true });
    } catch {
      setError(ERRORS.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      <label className={styles.label}>
        {COMMON.email}
        <div className={styles.inputWrap}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@smartflow.com"
            className={styles.input}
            required
          />
        </div>
      </label>
      <label className={styles.label}>
        {COMMON.password}
        <div className={styles.inputWrap}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={AUTH.passwordPlaceholder}
            className={styles.input}
            required
          />
        </div>
      </label>      <Button type="submit" loading={loading}>
        {COMMON.login}
      </Button>
      <p className={styles.hint}>{AUTH.testAccount}</p>
    </form>
  );
}
