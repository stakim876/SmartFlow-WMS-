import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { fetchDashboardSummary, DashboardSummary } from '@/features/dashboard/api/dashboard';
import {
  COMMON,
  DASHBOARD,
  ERRORS,
  NAV,
  NOTICES,
  ORDER_STATUS,
} from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './DashboardPage.module.css';

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={accent ? styles.kpiValueAccent : styles.kpiValue}>{value}</span>
    </div>
  );
}

function truncate(text: string, max = 60) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\u2026`;
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch {
        setError(ERRORS.loadFailed);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !summary) {
    return (
      <div>
        <PageHeader title={NAV.dashboard} description={DASHBOARD.description} />
        <div className={tableStyles.error}>{error || ERRORS.loadFailed}</div>
      </div>
    );
  }

  const { kpi, lowStockItems, recentInbound, recentOutbound, pinnedNotices } = summary;

  return (
    <div>
      <PageHeader title={NAV.dashboard} description={DASHBOARD.description} eyebrow="Overview" />

      <div className={styles.kpiGrid}>
        <KpiCard label={DASHBOARD.kpi.pendingInbound} value={kpi.pendingInbound} />
        <KpiCard label={DASHBOARD.kpi.pendingOutbound} value={kpi.pendingOutbound} />
        <KpiCard
          label={DASHBOARD.kpi.totalStock}
          value={kpi.totalStockQty.toLocaleString('ko-KR')}
        />
        <KpiCard
          label={DASHBOARD.kpi.lowStock(kpi.lowStockThreshold)}
          value={kpi.lowStockCount}
          accent={kpi.lowStockCount > 0}
        />
      </div>

      <div className={styles.kpiGridSecondary}>
        <KpiCard label={DASHBOARD.kpi.activeProducts} value={kpi.activeProducts} />
        <KpiCard label={DASHBOARD.kpi.todayInbound} value={kpi.todayInboundCompleted} />
        <KpiCard label={DASHBOARD.kpi.todayOutbound} value={kpi.todayOutboundCompleted} />
      </div>

      <div className={styles.panels}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{DASHBOARD.sections.recentInbound}</h2>
            <Link to="/inbound" className={styles.panelLink}>
              {DASHBOARD.viewAll}
            </Link>
          </div>
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>{COMMON.orderNo}</th>
                  <th>{COMMON.partner}</th>
                  <th>{COMMON.itemCount}</th>
                  <th>{COMMON.status}</th>
                  <th>{COMMON.date}</th>
                </tr>
              </thead>
              <tbody>
                {recentInbound.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={tableStyles.empty}>
                      {DASHBOARD.emptyInbound}
                    </td>
                  </tr>
                ) : (
                  recentInbound.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderNo}</td>
                      <td>{order.partnerName ?? COMMON.none}</td>
                      <td>{order.itemCount}</td>
                      <td>{ORDER_STATUS[order.status] ?? order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{DASHBOARD.sections.recentOutbound}</h2>
            <Link to="/outbound" className={styles.panelLink}>
              {DASHBOARD.viewAll}
            </Link>
          </div>
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>{COMMON.orderNo}</th>
                  <th>{COMMON.partner}</th>
                  <th>{COMMON.itemCount}</th>
                  <th>{COMMON.status}</th>
                  <th>{COMMON.date}</th>
                </tr>
              </thead>
              <tbody>
                {recentOutbound.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={tableStyles.empty}>
                      {DASHBOARD.emptyOutbound}
                    </td>
                  </tr>
                ) : (
                  recentOutbound.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderNo}</td>
                      <td>{order.partnerName ?? COMMON.none}</td>
                      <td>{order.itemCount}</td>
                      <td>{ORDER_STATUS[order.status] ?? order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{DASHBOARD.sections.lowStock}</h2>
            <Link to="/inventory" className={styles.panelLink}>
              {DASHBOARD.viewAll}
            </Link>
          </div>
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>{COMMON.name}</th>
                  <th>{COMMON.quantity}</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={tableStyles.empty}>
                      {DASHBOARD.emptyLowStock}
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td className={styles.lowQty}>
                        {item.quantity.toLocaleString('ko-KR')} {item.unit}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{DASHBOARD.sections.notices}</h2>
            <Link to="/notices" className={styles.panelLink}>
              {DASHBOARD.viewAll}
            </Link>
          </div>
          {pinnedNotices.length === 0 ? (
            <p className={styles.noticeEmpty}>{DASHBOARD.emptyNotices}</p>
          ) : (
            <ul className={styles.noticeList}>
              {pinnedNotices.map((notice) => (
                <li key={notice.id} className={styles.noticeItem}>
                  <div className={styles.noticeHead}>
                    <span className={styles.noticeBadge}>{NOTICES.pinnedBadge}</span>
                    <span className={styles.noticeTitle}>{notice.title}</span>
                    <span className={styles.noticeDate}>
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className={styles.noticePreview}>{truncate(notice.content)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
