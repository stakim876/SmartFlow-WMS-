import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  approveOutbound,
  cancelOutbound,
  completeOutbound,
  createOutboundOrder,
  fetchOutboundOrders,
  OutboundOrder,
} from '@/features/outbound/api/outbound';
import { OutboundFormModal } from '@/features/outbound/components/OutboundFormModal';
import { CompleteOutboundModal } from '@/features/outbound/components/CompleteOutboundModal';
import { OrderStatusBadge } from '@/features/inbound/components/OrderStatusBadge';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useCanWrite } from '@/shared/hooks/useCanWrite';
import { COMMON, ERRORS, NAV, ORDER_STATUS, OUTBOUND } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './OutboundPage.module.css';

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'] as const;

export function OutboundPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const canWrite = useCanWrite();
  const [orders, setOrders] = useState<OutboundOrder[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<OutboundOrder | null>(null);

  const load = async (selectedStatus: (typeof STATUS_OPTIONS)[number] = status) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchOutboundOrders({
        status: selectedStatus || undefined,
      });
      setOrders(result.items);
    } catch {
      setError(ERRORS.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    load(status);
  };

  const handleAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await load();
    } catch {
      setError(ERRORS.actionFailed);
    }
  };

  return (
    <div>
      <PageHeader
        title={NAV.outbound}
        description={OUTBOUND.description}
        action={
          canWrite ? <Button onClick={() => setFormOpen(true)}>{OUTBOUND.register}</Button> : undefined
        }
      />

      <form onSubmit={handleFilter} className={tableStyles.searchBar}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
          className={styles.statusSelect}
        >
          {STATUS_OPTIONS.map((value) => (
            <option key={value || 'all'} value={value}>
              {value ? ORDER_STATUS[value] : OUTBOUND.allStatuses}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          {COMMON.filter}
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
                <th>{COMMON.orderNo}</th>
                <th>{COMMON.partner}</th>
                <th>{COMMON.itemCount}</th>
                <th>{COMMON.status}</th>
                <th>{COMMON.date}</th>
                <th>{COMMON.actions}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className={tableStyles.empty}>
                    {OUTBOUND.empty}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNo}</td>
                    <td>{order.partner?.name ?? '-'}</td>
                    <td>{order.items.length}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      {canWrite ? (
                        <div className={tableStyles.actions}>
                        {order.status === 'PENDING' && isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(() => approveOutbound(order.id))}
                          >
                            {COMMON.approve}
                          </Button>
                        )}
                        {order.status === 'APPROVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (order.items.every((i) => i.locationId)) {
                                handleAction(() => completeOutbound(order.id));
                              } else {
                                setCompleteTarget(order);
                              }
                            }}
                          >
                            {COMMON.complete}
                          </Button>
                        )}
                        {(order.status === 'PENDING' || order.status === 'APPROVED') && (
                          <Button
                            variant="ghostDanger"
                            size="sm"
                            onClick={() => handleAction(() => cancelOutbound(order.id))}
                          >
                            {COMMON.cancel}
                          </Button>
                        )}
                      </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && canWrite && (
        <OutboundFormModal
          onClose={() => setFormOpen(false)}
          onSave={async (input) => {
            await createOutboundOrder(input);
            setFormOpen(false);
            await load();
          }}
        />
      )}

      {completeTarget && (
        <CompleteOutboundModal
          orderNo={completeTarget.orderNo}
          items={completeTarget.items}
          onClose={() => setCompleteTarget(null)}
          onComplete={async (items) => {
            await completeOutbound(completeTarget.id, items);
            setCompleteTarget(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
