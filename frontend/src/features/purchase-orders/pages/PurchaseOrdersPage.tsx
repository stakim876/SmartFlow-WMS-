import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  completePurchaseOrder,
  createPurchaseOrder,
  fetchPurchaseOrders,
  PurchaseOrder,
} from '@/features/purchase-orders/api/purchaseOrders';
import { PurchaseOrderFormModal } from '@/features/purchase-orders/components/PurchaseOrderFormModal';
import { OrderStatusBadge } from '@/features/inbound/components/OrderStatusBadge';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { COMMON, ERRORS, NAV, PURCHASE_ORDERS } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './PurchaseOrdersPage.module.css';

export function PurchaseOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchPurchaseOrders();
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
        title={NAV.purchaseOrders}
        description={PURCHASE_ORDERS.description}
        action={<Button onClick={() => setFormOpen(true)}>{PURCHASE_ORDERS.register}</Button>}
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
                <th>{PURCHASE_ORDERS.totalAmount}</th>
                <th>{COMMON.status}</th>
                <th>{COMMON.date}</th>
                <th>{COMMON.actions}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className={tableStyles.empty}>
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
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
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
                        {order.status === 'APPROVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(() => completePurchaseOrder(order.id))}
                          >
                            {COMMON.complete}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
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
