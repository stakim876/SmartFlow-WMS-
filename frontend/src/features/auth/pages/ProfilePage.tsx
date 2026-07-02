import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  changePassword,
  getProfile,
  updateProfile,
  User,
} from '@/features/auth/api/auth';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { COMMON, ERRORS, PROFILE, ROLE_LABELS } from '@/shared/constants/labels';
import formStyles from '@/shared/styles/form.shared.module.css';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await getProfile();
        if (cancelled) return;
        setProfile(data);
        setName(data.name);
        setUser(data);
      } catch {
        if (!cancelled) setLoadError(ERRORS.loadFailed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (name.trim().length < 2) {
      setProfileError(PROFILE.saveProfileFailed);
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await updateProfile(name.trim());
      setProfile(updated);
      setUser(updated);
      setProfileSuccess(PROFILE.profileSaved);
    } catch {
      setProfileError(PROFILE.saveProfileFailed);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError(PROFILE.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(PROFILE.passwordMismatch);
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(PROFILE.passwordSaved);
    } catch {
      setPasswordError(PROFILE.changePasswordFailed);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (loadError || !profile) {
    return <p className={formStyles.error}>{loadError || ERRORS.loadFailed}</p>;
  }

  const roleLabel = ROLE_LABELS[profile.role.name] ?? profile.role.name;

  return (
    <>
      <PageHeader title={PROFILE.title} description={PROFILE.description} />

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{PROFILE.profileSection}</h2>

          <div className={styles.readOnlyField}>
            <span className={styles.readOnlyLabel}>{COMMON.email}</span>
            <span className={styles.readOnlyValue}>{profile.email}</span>
          </div>

          <div className={styles.readOnlyField}>
            <span className={styles.readOnlyLabel}>{PROFILE.role}</span>
            <span className={styles.roleBadge}>{roleLabel}</span>
          </div>

          <div className={styles.readOnlyField}>
            <span className={styles.readOnlyLabel}>{PROFILE.memberSince}</span>
            <span className={styles.readOnlyValue}>
              {new Date(profile.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>

          <form className={formStyles.form} onSubmit={handleProfileSubmit}>
            <label className={formStyles.label}>
              {COMMON.userName}
              <input
                className={formStyles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                required
              />
            </label>

            {profileError && <p className={formStyles.error}>{profileError}</p>}
            {profileSuccess && <p className={formStyles.success}>{profileSuccess}</p>}

            <div className={formStyles.actions}>
              <Button type="submit" disabled={profileSaving || name.trim() === profile.name}>
                {profileSaving ? COMMON.loading : COMMON.save}
              </Button>
            </div>
          </form>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{PROFILE.passwordSection}</h2>

          <form className={formStyles.form} onSubmit={handlePasswordSubmit}>
            <label className={formStyles.label}>
              {PROFILE.currentPassword}
              <input
                type="password"
                className={formStyles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <label className={formStyles.label}>
              {PROFILE.newPassword}
              <input
                type="password"
                className={formStyles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className={formStyles.label}>
              {PROFILE.confirmPassword}
              <input
                type="password"
                className={formStyles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            {passwordError && <p className={formStyles.error}>{passwordError}</p>}
            {passwordSuccess && <p className={formStyles.success}>{passwordSuccess}</p>}

            <div className={formStyles.actions}>
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? COMMON.loading : COMMON.save}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
