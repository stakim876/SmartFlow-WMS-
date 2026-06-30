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
import { COMMON, ERRORS, NAV, OUTBOUND } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';

export function OutboundPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const [orders, setOrders] = useState<OutboundOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<OutboundOrder | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchOutboundOrders();
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
        title={NAV.outbound}
        description={OUTBOUND.description}
        action={<Button onClick={() => setFormOpen(true)}>{OUTBOUND.register}</Button>}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
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
