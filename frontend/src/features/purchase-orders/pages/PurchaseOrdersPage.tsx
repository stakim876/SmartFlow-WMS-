import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  convertPurchaseOrderToInbound,
  createPurchaseOrder,
  fetchPurchaseOrders,
  OrderStatus,
  PurchaseOrder,
} from '@/features/purchase-orders/api/purchaseOrders';
import { PurchaseOrderFormModal } from '@/features/purchase-orders/components/PurchaseOrderFormModal';
import { OrderStatusBadge } from '@/features/inbound/components/OrderStatusBadge';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useCanWrite } from '@/shared/hooks/useCanWrite';
import { COMMON, ERRORS, NAV, ORDER_STATUS, PURCHASE_ORDERS } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './PurchaseOrdersPage.module.css';

const STATUS_OPTIONS: Array<'' | OrderStatus> = [
  '',
  'PENDING',
  'APPROVED',
  'COMPLETED',
  'CANCELLED',
];

export function PurchaseOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const canWrite = useCanWrite();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [status, setStatus] = useState<'' | OrderStatus>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const load = async (selectedStatus: '' | OrderStatus = status) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchPurchaseOrders({
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
        title={NAV.purchaseOrders}
        description={PURCHASE_ORDERS.description}
        action={
          canWrite ? (
            <Button onClick={() => setFormOpen(true)}>{PURCHASE_ORDERS.register}</Button>
          ) : undefined
        }
      />

      <form onSubmit={handleFilter} className={tableStyles.searchBar}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | OrderStatus)}
          className={styles.statusSelect}
        >
          {STATUS_OPTIONS.map((value) => (
            <option key={value || 'all'} value={value}>
              {value ? ORDER_STATUS[value] : PURCHASE_ORDERS.allStatuses}
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
                <th>{PURCHASE_ORDERS.totalAmount}</th>
                <th>{PURCHASE_ORDERS.inboundOrder}</th>
                <th>{COMMON.status}</th>
                <th>{COMMON.date}</th>
                <th>{COMMON.actions}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className={tableStyles.empty}>
                    {PURCHASE_ORDERS.empty}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNo}</td>
                    <td>{order.partner.name}</td>
                    <td>{order.items.length}</td>
                    <td className={styles.amount}>
                      {order.totalAmount.toLocaleString()}
                      {COMMON.currency}
                    </td>
                    <td>
                      {order.inboundOrder ? (
                        <span>
                          {order.inboundOrder.orderNo}{' '}
                          <OrderStatusBadge status={order.inboundOrder.status} />
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
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
                            onClick={() => handleAction(() => approvePurchaseOrder(order.id))}
                          >
                            {COMMON.approve}
                          </Button>
                        )}
                        {order.status === 'APPROVED' && !order.inboundOrder && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleAction(() => convertPurchaseOrderToInbound(order.id))
                            }
                          >
                            {PURCHASE_ORDERS.convertToInbound}
                          </Button>
                        )}
                        {(order.status === 'PENDING' || order.status === 'APPROVED') && (
                          <Button
                            variant="ghostDanger"
                            size="sm"
                            onClick={() => handleAction(() => cancelPurchaseOrder(order.id))}
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
        <PurchaseOrderFormModal
          onClose={() => setFormOpen(false)}
          onSave={async (input) => {
            await createPurchaseOrder(input);
            setFormOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}
