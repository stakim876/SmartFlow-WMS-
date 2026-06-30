import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, Notification } from '@/shared/api/notifications';
import { connectNotificationSocket } from '@/shared/api/socket';
import { ADVANCED } from '@/shared/constants/labels';
import styles from './NotificationBell.module.css';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchNotifications({ limit: 10 });
      setItems(result.items);
      setUnreadCount(result.unreadCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const unsubscribe = connectNotificationSocket(() => {
      void load();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleToggle = async () => {
    if (!open) {
      await load();
    }
    setOpen((prev) => !prev);
  };

  const handleRead = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationRead(notification.id);
      await load();
    }
    setOpen(false);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await load();
  };

  return (
    <div className={styles.wrap} ref={panelRef}>
      <button
        type="button"
        className={styles.button}
        onClick={handleToggle}
        aria-label={ADVANCED.notifications}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 17H9l-1 2h8l-1-2ZM18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>{ADVANCED.notifications}</span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAll} onClick={handleMarkAll}>
                {ADVANCED.markAllRead}
              </button>
            )}
          </div>
          {loading ? (
            <p className={styles.empty}>...</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>{ADVANCED.noNotifications}</p>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={item.isRead ? styles.item : styles.itemUnread}>
                  {item.link ? (
                    <Link
                      to={item.link}
                      className={styles.itemLink}
                      onClick={() => handleRead(item)}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.message}</span>
                    </Link>
                  ) : (
                    <button type="button" className={styles.itemLink} onClick={() => handleRead(item)}>
                      <strong>{item.title}</strong>
                      <span>{item.message}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
