import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  createNotice,
  deleteNotice,
  fetchNotices,
  Notice,
  NoticeInput,
  updateNotice,
} from '@/features/notices/api/notices';
import { NoticeFormModal } from '@/features/notices/components/NoticeFormModal';
import { NoticeDetailModal } from '@/features/notices/components/NoticeDetailModal';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { COMMON, ERRORS, NAV, NOTICES } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './NoticesPage.module.css';

function truncateContent(content: string, maxLength = 80) {
  if (content.length <= maxLength) {
    return content;
  }
  return `${content.slice(0, maxLength)}\u2026`;
}

export function NoticesPage() {
  const currentUser = useAuthStore((s) => s.user);
  const canManage = currentUser?.role.name === 'ADMIN' || currentUser?.role.name === 'STAFF';
  const isAdmin = currentUser?.role.name === 'ADMIN';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadNotices = async (page = 1, keyword = search) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchNotices({
        page,
        limit: 20,
        search: keyword || undefined,
      });
      setNotices(result.items);
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
    loadNotices();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadNotices(1, search);
  };

  const handleSave = async (input: NoticeInput) => {
    if (editingNotice) {
      await updateNotice(editingNotice.id, input);
    } else {
      await createNotice(input);
    }
    setFormOpen(false);
    setEditingNotice(null);
    setViewingNotice(null);
    await loadNotices(meta.page, search);
  };

  const handleTogglePin = async (notice: Notice) => {
    try {
      await updateNotice(notice.id, { isPinned: !notice.isPinned });
      await loadNotices(meta.page, search);
    } catch {
      setError(ERRORS.actionFailed);
    }
  };

  const handleDelete = async (notice: Notice) => {
    if (!window.confirm(NOTICES.deleteConfirm(notice.title))) {
      return;
    }
    try {
      await deleteNotice(notice.id);
      setViewingNotice(null);
      await loadNotices(meta.page, search);
    } catch {
      setError(ERRORS.actionFailed);
    }
  };

  const openEdit = (notice: Notice) => {
    setViewingNotice(null);
    setEditingNotice(notice);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={NAV.notices}
        description={NOTICES.description(meta.total)}
        action={
          canManage ? (
            <Button
              onClick={() => {
                setEditingNotice(null);
                setFormOpen(true);
              }}
            >
              {NOTICES.add}
            </Button>
          ) : undefined
        }
      />

      <form onSubmit={handleSearch} className={tableStyles.searchBar}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={NOTICES.searchPlaceholder}
          className={tableStyles.searchInput}
        />
        <Button type="submit" variant="secondary" size="sm">
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
                <th>{NOTICES.title}</th>
                <th>{NOTICES.author}</th>
                <th>{COMMON.date}</th>
                {canManage && <th>{COMMON.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className={tableStyles.empty}>
                    {NOTICES.empty}
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.id} className={notice.isPinned ? styles.pinnedRow : undefined}>
                    <td>
                      <button
                        type="button"
                        className={styles.titleBtn}
                        onClick={() => setViewingNotice(notice)}
                      >
                        {notice.isPinned && (
                          <span className={styles.pinnedBadge}>{NOTICES.pinnedBadge}</span>
                        )}
                        <span className={styles.titleText}>{notice.title}</span>
                        <span className={styles.preview}>{truncateContent(notice.content)}</span>
                      </button>
                    </td>
                    <td>{notice.authorName ?? COMMON.none}</td>
                    <td>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</td>
                    {canManage && (
                      <td>
                        <div className={tableStyles.actions}>
                          <button
                            type="button"
                            className={tableStyles.linkBtn}
                            onClick={() => handleTogglePin(notice)}
                          >
                            {notice.isPinned ? NOTICES.unpin : NOTICES.pin}
                          </button>
                          <button
                            type="button"
                            className={tableStyles.linkBtn}
                            onClick={() => openEdit(notice)}
                          >
                            {COMMON.edit}
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              className={tableStyles.linkBtnDanger}
                              onClick={() => handleDelete(notice)}
                            >
                              {COMMON.delete}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => loadNotices(meta.page - 1, search)}
          >
            {COMMON.prev}
          </Button>
          <span>
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => loadNotices(meta.page + 1, search)}
          >
            {COMMON.next}
          </Button>
        </div>
      )}

      {formOpen && (
        <NoticeFormModal
          notice={editingNotice}
          onClose={() => {
            setFormOpen(false);
            setEditingNotice(null);
          }}
          onSave={handleSave}
        />
      )}

      {viewingNotice && (
        <NoticeDetailModal
          notice={viewingNotice}
          canEdit={canManage}
          onClose={() => setViewingNotice(null)}
          onEdit={() => openEdit(viewingNotice)}
        />
      )}
    </div>
  );
}
