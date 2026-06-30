import { Button } from '@/shared/components/common/Button';
import { Notice } from '@/features/notices/api/notices';
import { COMMON, NOTICES } from '@/shared/constants/labels';
import styles from './NoticeDetailModal.module.css';

interface NoticeDetailModalProps {
  notice: Notice;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function NoticeDetailModal({ notice, canEdit, onClose, onEdit }: NoticeDetailModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{notice.title}</h2>
          {notice.isPinned && <span className={styles.pinnedBadge}>{NOTICES.pinnedBadge}</span>}
        </div>
        <div className={styles.meta}>
          <span>{NOTICES.author}: {notice.authorName ?? COMMON.none}</span>
          <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>
        <div className={styles.content}>{notice.content}</div>
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            {COMMON.cancel}
          </Button>
          {canEdit && (
            <Button type="button" onClick={onEdit}>
              {COMMON.edit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
