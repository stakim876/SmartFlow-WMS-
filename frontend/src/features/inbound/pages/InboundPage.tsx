import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  approveInbound,
  cancelInbound,
  completeInbound,
  createInboundOrder,
  fetchInboundOrders,
  InboundOrder,
} from '@/features/inbound/api/inbound';
import { InboundFormModal } from '@/features/inbound/components/InboundFormModal';
import { CompleteInboundModal } from '@/features/inbound/components/CompleteInboundModal';
import { OrderStatusBadge } from '@/features/inbound/components/OrderStatusBadge';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useCanWrite } from '@/shared/hooks/useCanWrite';
import { COMMON, ERRORS, INBOUND, NAV, ORDER_STATUS } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './InboundPage.module.css';

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'] as const;

export function InboundPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const canWrite = useCanWrite();
  const [orders, setOrders] = useState<InboundOrder[]>([]);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<InboundOrder | null>(null);

  const load = async (selectedStatus: (typeof STATUS_OPTIONS)[number] = status) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchInboundOrders({
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
        title={NAV.inbound}
        description={INBOUND.description}
        action={
          canWrite ? <Button onClick={() => setFormOpen(true)}>{INBOUND.register}</Button> : undefined
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
              {value ? ORDER_STATUS[value] : INBOUND.allStatuses}
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
                    {INBOUND.empty}
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
                            onClick={() => handleAction(() => approveInbound(order.id))}
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
                                handleAction(() => completeInbound(order.id));
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
                            onClick={() => handleAction(() => cancelInbound(order.id))}
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
        <InboundFormModal
          onClose={() => setFormOpen(false)}
          onSave={async (input) => {
            await createInboundOrder(input);
            setFormOpen(false);
            await load();
          }}
        />
      )}

      {completeTarget && (
        <CompleteInboundModal
          orderNo={completeTarget.orderNo}
          items={completeTarget.items}
          onClose={() => setCompleteTarget(null)}
          onComplete={async (items) => {
            await completeInbound(completeTarget.id, items);
            setCompleteTarget(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
