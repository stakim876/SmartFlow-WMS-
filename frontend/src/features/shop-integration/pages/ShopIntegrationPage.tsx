import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  fetchShopMappings,
  fetchShopOrderSyncs,
  fetchShopStatus,
  fulfillShopOrder,
  pullShopOrders,
  pushShopStock,
  ShopIntegrationStatus,
  ShopOrderSync,
  ShopProductMapping,
  syncShopProducts,
} from '@/features/shop-integration/api/shopIntegration';
import { COMMON, ERRORS, ORDER_STATUS, SHOP_INTEGRATION } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './ShopIntegrationPage.module.css';

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? styles.badgeOk : styles.badgeWarn}>{label}</span>
  );
}

export function ShopIntegrationPage() {
  const [status, setStatus] = useState<ShopIntegrationStatus | null>(null);
  const [mappings, setMappings] = useState<ShopProductMapping[]>([]);
  const [orders, setOrders] = useState<ShopOrderSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fulfillForm, setFulfillForm] = useState<Record<number, { carrierCode: string; trackingNumber: string }>>({});

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [statusData, mappingData, orderData] = await Promise.all([
        fetchShopStatus(),
        fetchShopMappings(),
        fetchShopOrderSyncs(),
      ]);
      setStatus(statusData);
      setMappings(mappingData);
      setOrders(orderData);
    } catch {
      setError(ERRORS.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const runAction = async (key: string, action: () => Promise<{ mappedCount?: number; skippedCount?: number; pushedCount?: number; createdCount?: number }>) => {
    setActionLoading(key);
    setMessage('');
    setError('');
    try {
      const result = await action();
      if (key === 'sync' && result.mappedCount != null) {
        setMessage(SHOP_INTEGRATION.syncResult(result.mappedCount, result.skippedCount ?? 0));
      } else if (key === 'stock' && result.pushedCount != null) {
        setMessage(SHOP_INTEGRATION.stockResult(result.pushedCount));
      } else if (key === 'orders' && result.createdCount != null) {
        setMessage(SHOP_INTEGRATION.orderResult(result.createdCount, result.skippedCount ?? 0));
      }
      await loadAll();
    } catch {
      setError(ERRORS.actionFailed);
    } finally {
      setActionLoading('');
    }
  };

  const handleFulfill = async (shopOrderId: number) => {
    const form = fulfillForm[shopOrderId];
    if (!form?.carrierCode || !form?.trackingNumber) {
      setError('택배사 코드와 송장번호를 입력하세요.');
      return;
    }
    setActionLoading(`fulfill-${shopOrderId}`);
    setError('');
    try {
      await fulfillShopOrder(shopOrderId, {
        carrierCode: form.carrierCode,
        trackingNumber: form.trackingNumber,
        status: 'shipping',
      });
      setMessage(`주문 #${shopOrderId} 배송 정보를 전송했습니다.`);
      await loadAll();
    } catch {
      setError(ERRORS.actionFailed);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.page}>
      <PageHeader title={SHOP_INTEGRATION.title} description={SHOP_INTEGRATION.subtitle} />

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.message}>{message}</div>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{SHOP_INTEGRATION.status}</h2>
        {status && (
          <div className={styles.statusGrid}>
            <div>
              <span className={styles.label}>{SHOP_INTEGRATION.configured}</span>
              <StatusBadge
                ok={status.configured}
                label={status.configured ? SHOP_INTEGRATION.configured : SHOP_INTEGRATION.notConfigured}
              />
            </div>
            <div>
              <span className={styles.label}>{SHOP_INTEGRATION.connected}</span>
              <StatusBadge
                ok={status.connected}
                label={status.connected ? SHOP_INTEGRATION.connected : SHOP_INTEGRATION.disconnected}
              />
            </div>
            <div>
              <span className={styles.label}>{SHOP_INTEGRATION.shopUrl}</span>
              <span>{status.shopApiUrl}</span>
            </div>
            <div>
              <span className={styles.label}>{SHOP_INTEGRATION.mappingCount}</span>
              <span>{status.mappingCount}</span>
            </div>
            <div>
              <span className={styles.label}>{SHOP_INTEGRATION.orderSyncCount}</span>
              <span>{status.orderSyncCount}</span>
            </div>
          </div>
        )}
        {!status?.configured && (
          <p className={styles.hint}>{SHOP_INTEGRATION.configHint}</p>
        )}
        <div className={styles.actions}>
          <Button
            disabled={!!actionLoading}
            onClick={() => runAction('sync', syncShopProducts)}
          >
            {actionLoading === 'sync' ? COMMON.loading : SHOP_INTEGRATION.syncProducts}
          </Button>
          <Button
            variant="secondary"
            disabled={!!actionLoading}
            onClick={() => runAction('stock', pushShopStock)}
          >
            {actionLoading === 'stock' ? COMMON.loading : SHOP_INTEGRATION.pushStock}
          </Button>
          <Button
            variant="secondary"
            disabled={!!actionLoading}
            onClick={() => runAction('orders', pullShopOrders)}
          >
            {actionLoading === 'orders' ? COMMON.loading : SHOP_INTEGRATION.pullOrders}
          </Button>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{SHOP_INTEGRATION.mappings}</h2>
        {mappings.length === 0 ? (
          <p className={styles.empty}>{SHOP_INTEGRATION.noMappings}</p>
        ) : (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>{SHOP_INTEGRATION.shopProductId}</th>
                  <th>{SHOP_INTEGRATION.shopSku}</th>
                  <th>{SHOP_INTEGRATION.shopName}</th>
                  <th>{SHOP_INTEGRATION.wmsSku}</th>
                  <th>{SHOP_INTEGRATION.wmsName}</th>
                  <th>{SHOP_INTEGRATION.lastStockPush}</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((row) => (
                  <tr key={row.id}>
                    <td>{row.shopProductId}</td>
                    <td>{row.shopSku ?? COMMON.none}</td>
                    <td>{row.shopName ?? COMMON.none}</td>
                    <td>{row.product.sku}</td>
                    <td>{row.product.name}</td>
                    <td>
                      {row.lastStockPush
                        ? new Date(row.lastStockPush).toLocaleString('ko-KR')
                        : COMMON.none}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{SHOP_INTEGRATION.orders}</h2>
        {orders.length === 0 ? (
          <p className={styles.empty}>{SHOP_INTEGRATION.noOrders}</p>
        ) : (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>{SHOP_INTEGRATION.shopOrderId}</th>
                  <th>{SHOP_INTEGRATION.outboundOrderNo}</th>
                  <th>{COMMON.status}</th>
                  <th>{SHOP_INTEGRATION.fulfill}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((row) => (
                  <tr key={row.id}>
                    <td>#{row.shopOrderId}</td>
                    <td>{row.outboundOrder?.orderNo ?? COMMON.none}</td>
                    <td>
                      {row.outboundOrder?.status
                        ? ORDER_STATUS[row.outboundOrder.status] ?? row.outboundOrder.status
                        : row.shopStatus ?? COMMON.none}
                    </td>
                    <td>
                      {row.fulfilledAt ? (
                        <span className={styles.fulfilled}>
                          {new Date(row.fulfilledAt).toLocaleString('ko-KR')}
                        </span>
                      ) : (
                        <div className={styles.fulfillRow}>
                          <input
                            className={styles.input}
                            placeholder={SHOP_INTEGRATION.carrierCode}
                            value={fulfillForm[row.shopOrderId]?.carrierCode ?? ''}
                            onChange={(e) =>
                              setFulfillForm((prev) => ({
                                ...prev,
                                [row.shopOrderId]: {
                                  carrierCode: e.target.value,
                                  trackingNumber: prev[row.shopOrderId]?.trackingNumber ?? '',
                                },
                              }))
                            }
                          />
                          <input
                            className={styles.input}
                            placeholder={SHOP_INTEGRATION.trackingNumber}
                            value={fulfillForm[row.shopOrderId]?.trackingNumber ?? ''}
                            onChange={(e) =>
                              setFulfillForm((prev) => ({
                                ...prev,
                                [row.shopOrderId]: {
                                  carrierCode: prev[row.shopOrderId]?.carrierCode ?? '',
                                  trackingNumber: e.target.value,
                                },
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            disabled={actionLoading === `fulfill-${row.shopOrderId}`}
                            onClick={() => handleFulfill(row.shopOrderId)}
                          >
                            {actionLoading === `fulfill-${row.shopOrderId}`
                              ? COMMON.loading
                              : SHOP_INTEGRATION.fulfillSubmit}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
