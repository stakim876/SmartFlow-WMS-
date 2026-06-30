import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  adjustInventory,
  fetchInventory,
  fetchLocations,
  fetchMovements,
  fetchWarehouses,
  InventoryItem,
  InventoryMovement,
  LocationOption,
  MovementType,
  transferInventory,
  WarehouseOption,
} from '@/features/inventory/api/inventory';
import { AdjustInventoryModal } from '@/features/inventory/components/AdjustInventoryModal';
import { TransferInventoryModal } from '@/features/inventory/components/TransferInventoryModal';
import { MovementTypeBadge } from '@/features/inventory/components/MovementTypeBadge';
import { exportInventoryExcel, exportInventoryPdf, exportMovementsExcel } from '@/shared/api/export';
import { COMMON, ERRORS, FORMAT, INVENTORY, MOVEMENT_TYPE, NAV, PRODUCTS, ADVANCED } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './InventoryPage.module.css';

type Tab = 'stock' | 'movements';

const movementTypeOptions: { value: '' | MovementType; label: string }[] = [
  { value: '', label: INVENTORY.allTypes },
  { value: 'INBOUND', label: MOVEMENT_TYPE.INBOUND },
  { value: 'OUTBOUND', label: MOVEMENT_TYPE.OUTBOUND },
  { value: 'ADJUSTMENT', label: MOVEMENT_TYPE.ADJUSTMENT },
  { value: 'TRANSFER', label: MOVEMENT_TYPE.TRANSFER },
];

export function InventoryPage() {
  const [tab, setTab] = useState<Tab>('stock');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [movementType, setMovementType] = useState<'' | MovementType>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [transferTarget, setTransferTarget] = useState<InventoryItem | null>(null);

  const loadInventory = async (page = 1, keyword = search, selectedWarehouse = warehouseId) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchInventory({
        page,
        limit: 20,
        search: keyword || undefined,
        warehouseId: selectedWarehouse || undefined,
      });
      setItems(result.items);
      setMeta({
        page: result.meta.page,
        totalPages: result.meta.totalPages,
        total: result.meta.total,
      });
    } catch {
      setError(ERRORS.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (page = 1, type: '' | MovementType = movementType) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchMovements({
        page,
        limit: 20,
        type: type || undefined,
      });
      setMovements(result.items);
      setMeta({
        page: result.meta.page,
        totalPages: result.meta.totalPages,
        total: result.meta.total,
      });
    } catch {
      setError(ERRORS.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchWarehouses(), fetchLocations()])
      .then(([wh, loc]) => {
        setWarehouses(wh);
        setLocations(loc);
      })
      .catch(() => setError(ERRORS.masterLoadFailed));
    loadInventory();
  }, []);

  useEffect(() => {
    if (tab === 'movements') {
      loadMovements(1);
    }
  }, [tab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory(1, search, warehouseId);
  };

  const handleMovementFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadMovements(1, movementType);
  };

  const handleTabChange = (next: Tab) => {
    setTab(next);
    setError('');
    setMeta({ page: 1, totalPages: 1, total: 0 });
  };

  const handleExport = async () => {
    try {
      if (tab === 'stock') {
        await exportInventoryExcel();
      } else {
        await exportMovementsExcel();
      }
    } catch {
      setError(ERRORS.actionFailed);
    }
  };

  const handleExportPdf = async () => {
    try {
      await exportInventoryPdf();
    } catch {
      setError(ERRORS.actionFailed);
    }
  };

  return (
    <div>
      <PageHeader
        title={NAV.inventory}
        description={
          tab === 'stock'
            ? INVENTORY.stockDescription(meta.total)
            : INVENTORY.movementDescription(meta.total)
        }
        action={
          tab === 'stock' ? (
            <div className={styles.exportActions}>
              <Button variant="secondary" size="sm" onClick={handleExport}>
                {ADVANCED.exportInventory}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportPdf}>
                {ADVANCED.exportInventoryPdf}
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={handleExport}>
              {ADVANCED.exportMovements}
            </Button>
          )
        }
      />

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === 'stock' ? styles.tabActive : styles.tab}
          onClick={() => handleTabChange('stock')}
        >
          {INVENTORY.tabStock}
        </button>
        <button
          type="button"
          className={tab === 'movements' ? styles.tabActive : styles.tab}
          onClick={() => handleTabChange('movements')}
        >
          {INVENTORY.tabMovements}
        </button>
      </div>

      {tab === 'stock' ? (
        <form onSubmit={handleSearch} className={styles.filters}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={PRODUCTS.searchPlaceholder}
            className={styles.input}
          />
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className={styles.select}
          >
            <option value="">{INVENTORY.allWarehouses}</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {FORMAT.codeName(wh.code, wh.name)}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            {COMMON.search}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleMovementFilter} className={styles.filters}>
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value as '' | MovementType)}
            className={styles.select}
          >
            {movementTypeOptions.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            {COMMON.filter}
          </Button>
        </form>
      )}

      {error && <div className={tableStyles.error}>{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'stock' ? (
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>{COMMON.name}</th>
                <th>{COMMON.warehouse}</th>
                <th>{COMMON.location}</th>
                <th>{COMMON.quantity}</th>
                <th>{COMMON.unit}</th>
                <th>{INVENTORY.colUpdatedAt}</th>
                <th>{COMMON.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className={tableStyles.empty}>
                    {INVENTORY.emptyStock}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product.sku}</td>
                    <td>{item.product.name}</td>
                    <td>{item.location.warehouse.name}</td>
                    <td>{item.location.code}</td>
                    <td className={styles.quantity}>{item.quantity.toLocaleString()}</td>
                    <td>{item.product.unit}</td>
                    <td>{new Date(item.updatedAt).toLocaleString('ko-KR')}</td>
                    <td>
                      <div className={tableStyles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAdjustTarget(item)}
                        >
                          {INVENTORY.adjust}
                        </Button>
                        {item.quantity > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransferTarget(item)}
                          >
                            {INVENTORY.transfer}
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
      ) : (
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>{COMMON.date}</th>
                <th>{COMMON.status}</th>
                <th>{COMMON.name}</th>
                <th>{COMMON.location}</th>
                <th>{COMMON.quantity}</th>
                <th>{COMMON.beforeAfter}</th>
                <th>{COMMON.note}</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className={tableStyles.empty}>
                    {INVENTORY.emptyMovements}
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.createdAt).toLocaleString('ko-KR')}</td>
                    <td>
                      <MovementTypeBadge type={m.type} />
                    </td>
                    <td>
                      {m.product.sku} / {m.product.name}
                    </td>
                    <td>
                      {m.location
                        ? `${m.location.warehouse.code} - ${m.location.code}`
                        : '-'}
                    </td>
                    <td>{m.quantity.toLocaleString()}</td>
                    <td>{FORMAT.beforeAfter(m.beforeQty, m.afterQty)}</td>
                    <td>{m.note ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {adjustTarget && (
        <AdjustInventoryModal
          inventory={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSave={async (quantity, note) => {
            await adjustInventory(adjustTarget.id, quantity, note);
            setAdjustTarget(null);
            await loadInventory(meta.page, search, warehouseId);
          }}
        />
      )}

      {transferTarget && (
        <TransferInventoryModal
          inventory={transferTarget}
          locations={locations}
          onClose={() => setTransferTarget(null)}
          onSave={async (input) => {
            await transferInventory(input);
            setTransferTarget(null);
            await loadInventory(meta.page, search, warehouseId);
          }}
        />
      )}

      {meta.totalPages > 1 && (
        <div className={tableStyles.pagination}>
          <Button
            variant="secondary"
            disabled={meta.page <= 1}
            onClick={() =>
              tab === 'stock' ? loadInventory(meta.page - 1) : loadMovements(meta.page - 1)
            }
          >
            {COMMON.prev}
          </Button>
          <span>
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={meta.page >= meta.totalPages}
            onClick={() =>
              tab === 'stock' ? loadInventory(meta.page + 1) : loadMovements(meta.page + 1)
            }
          >
            {COMMON.next}
          </Button>
        </div>
      )}
    </div>
  );
}
