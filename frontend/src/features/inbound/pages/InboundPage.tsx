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
import { COMMON, ERRORS, INBOUND, NAV } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';

export function InboundPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const [orders, setOrders] = useState<InboundOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<InboundOrder | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchInboundOrders();
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
        action={<Button onClick={() => setFormOpen(true)}>{INBOUND.register}</Button>}
      />

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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
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
