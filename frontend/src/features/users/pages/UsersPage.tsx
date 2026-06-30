import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  resetUserPassword,
  Role,
  updateUser,
  User,
  CreateUserInput,
  UpdateUserInput,
} from '@/features/users/api/users';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { ResetPasswordModal } from '@/features/users/components/ResetPasswordModal';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { COMMON, ERRORS, NAV, ROLE_LABELS, USERS } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './UsersPage.module.css';

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role.name === 'ADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadUsers = async (page = 1, keyword = search, selectedRoleId = roleId) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchUsers({
        page,
        limit: 20,
        search: keyword || undefined,
        roleId: selectedRoleId || undefined,
      });
      setUsers(result.items);
      setMeta({
        page: result.meta.page,
        totalPages: result.meta.totalPages,
        total: result.meta.total,
      });
    } catch {
      setError(ERRORS.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchRoles().then(setRoles);
    loadUsers();
  }, [isAdmin]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, search, roleId);
  };

  const handleSave = async (input: CreateUserInput | UpdateUserInput) => {
    if (editingUser) {
      await updateUser(editingUser.id, input as UpdateUserInput);
    } else {
      await createUser(input as CreateUserInput);
    }
    setModalOpen(false);
    setEditingUser(null);
    await loadUsers(meta.page, search, roleId);
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(USERS.deleteConfirm(user.name))) return;
    await deleteUser(user.id);
    await loadUsers(meta.page, search, roleId);
  };

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title={NAV.users} description={USERS.adminOnly} />
        <div className={styles.notice}>{USERS.adminOnly}</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={NAV.users}
        description={USERS.description(meta.total)}
        action={
          <Button
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
          >
            {USERS.add}
          </Button>
        }
      />

      <form onSubmit={handleSearch} className={tableStyles.searchBar}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={USERS.searchPlaceholder}
          className={tableStyles.searchInput}
        />
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className={styles.roleSelect}
        >
          <option value="">{USERS.allRoles}</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {ROLE_LABELS[role.name] ?? role.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          {COMMON.search}
        </Button>
      </form>

      {error && <div className={tableStyles.error}>{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>{COMMON.userName}</th>
                <th>{COMMON.email}</th>
                <th>{USERS.role}</th>
                <th>{COMMON.date}</th>
                <th>{COMMON.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={tableStyles.empty}>
                    {USERS.empty}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={
                          user.role.name === 'ADMIN'
                            ? styles.roleBadge
                            : styles.roleBadgeStaff
                        }
                      >
                        {ROLE_LABELS[user.role.name] ?? user.role.name}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <div className={tableStyles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setModalOpen(true);
                          }}
                        >
                          {COMMON.edit}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResetTarget(user)}
                        >
                          {USERS.resetPassword}
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghostDanger"
                            size="sm"
                            onClick={() => handleDelete(user)}
                          >
                            {COMMON.delete}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className={tableStyles.pagination}>
          <Button
            variant="secondary"
            disabled={meta.page <= 1}
            onClick={() => loadUsers(meta.page - 1, search, roleId)}
          >
            {COMMON.prev}
          </Button>
          <span>
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={meta.page >= meta.totalPages}
            onClick={() => loadUsers(meta.page + 1, search, roleId)}
          >
            {COMMON.next}
          </Button>
        </div>
      )}

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          roles={roles}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSave}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onSave={async (password) => {
            await resetUserPassword(resetTarget.id, password);
            setResetTarget(null);
          }}
        />
      )}
    </div>
  );
}
