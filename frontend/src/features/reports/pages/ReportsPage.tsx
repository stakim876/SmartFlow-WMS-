import { useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import {
  exportInboundExcel,
  exportInventoryExcel,
  exportMovementsExcel,
  exportOutboundExcel,
} from '@/shared/api/export';
import { COMMON, ERRORS, NAV, REPORTS } from '@/shared/constants/labels';
import styles from './ReportsPage.module.css';

export function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const runExport = async (key: string, action: () => Promise<void>) => {
    setError('');
    setLoading(key);
    try {
      await action();
    } catch {
      setError(ERRORS.actionFailed);
    } finally {
      setLoading('');
    }
  };

  return (
    <div>
      <PageHeader title={NAV.reports} description={REPORTS.description} />

      <section className={styles.card}>
        <h2 className={styles.title}>{REPORTS.period}</h2>
        <div className={styles.dateRow}>
          <label className={styles.label}>
            {REPORTS.from}
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            {REPORTS.to}
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={styles.input}
            />
          </label>
        </div>
        <p className={styles.hint}>{REPORTS.hint}</p>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.card}>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            loading={loading === 'inbound'}
            onClick={() => runExport('inbound', () => exportInboundExcel(from, to))}
          >
            {REPORTS.inbound}
          </Button>
          <Button
            variant="secondary"
            loading={loading === 'outbound'}
            onClick={() => runExport('outbound', () => exportOutboundExcel(from, to))}
          >
            {REPORTS.outbound}
          </Button>
          <Button
            variant="secondary"
            loading={loading === 'movements'}
            onClick={() => runExport('movements', () => exportMovementsExcel(from, to))}
          >
            {REPORTS.movements}
          </Button>
          <Button
            variant="secondary"
            loading={loading === 'inventory'}
            onClick={() => runExport('inventory', () => exportInventoryExcel())}
          >
            {REPORTS.inventory}
          </Button>
        </div>
        <p className={styles.note}>{COMMON.date}: {REPORTS.inventory}은 현재 재고 스냅샷입니다.</p>
      </section>
    </div>
  );
}
