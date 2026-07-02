import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/shared/components/common/Button';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import {
  createLocation,
  createWarehouse,
  deleteLocation,
  deleteWarehouse,
  fetchLocations,
  fetchWarehouses,
  Location,
  LocationInput,
  updateLocation,
  updateWarehouse,
  Warehouse,
  WarehouseInput,
} from '@/features/warehouses/api/warehouses';
import { WarehouseFormModal } from '@/features/warehouses/components/WarehouseFormModal';
import { LocationFormModal } from '@/features/warehouses/components/LocationFormModal';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { COMMON, ERRORS, NAV, WAREHOUSES } from '@/shared/constants/labels';
import tableStyles from '@/shared/styles/table.shared.module.css';
import styles from './WarehousesPage.module.css';

export function WarehousesPage() {
  const isAdmin = useAuthStore((s) => s.user?.role.name === 'ADMIN');

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationsError, setLocationsError] = useState('');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const loadWarehouses = async (page = 1, keyword = search) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchWarehouses({
        page,
        limit: 20,
        search: keyword || undefined,
      });
      setWarehouses(result.items);
      setMeta({
        page: result.meta.page,
        totalPages: result.meta.totalPages,
        total: result.meta.total,
      });

      if (selectedWarehouse) {
        const stillExists = result.items.find((w) => w.id === selectedWarehouse.id);
        if (!stillExists) {
          setSelectedWarehouse(null);
          setLocations([]);
        }
      }
    } catch {
      setError(ERRORS.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async (warehouse: Warehouse) => {
    setLocationsLoading(true);
    setLocationsError('');
    try {
      const items = await fetchLocations(warehouse.id);
      setLocations(items);
    } catch {
      setLocationsError(ERRORS.loadFailed);
    } finally {
      setLocationsLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      loadLocations(selectedWarehouse);
    } else {
      setLocations([]);
    }
  }, [selectedWarehouse?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadWarehouses(1, search);
  };

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse((prev) => (prev?.id === warehouse.id ? null : warehouse));
  };

  const handleSaveWarehouse = async (input: WarehouseInput) => {
    if (editingWarehouse) {
      await updateWarehouse(editingWarehouse.id, input);
    } else {
      await createWarehouse(input);
    }
    setWarehouseModalOpen(false);
    setEditingWarehouse(null);
    await loadWarehouses(meta.page, search);
  };

  const handleDeleteWarehouse = async (warehouse: Warehouse) => {
    if (!window.confirm(WAREHOUSES.deleteWarehouseConfirm(warehouse.name))) {
      return;
    }
    await deleteWarehouse(warehouse.id);
    if (selectedWarehouse?.id === warehouse.id) {
      setSelectedWarehouse(null);
    }
    await loadWarehouses(meta.page, search);
  };

  const handleSaveLocation = async (input: LocationInput) => {
    if (!selectedWarehouse) return;

    if (editingLocation) {
      await updateLocation(editingLocation.id, input);
    } else {
      await createLocation(selectedWarehouse.id, input);
    }
    setLocationModalOpen(false);
    setEditingLocation(null);
    await loadLocations(selectedWarehouse);
    await loadWarehouses(meta.page, search);
  };

  const handleDeleteLocation = async (location: Location) => {
    if (!window.confirm(WAREHOUSES.deleteLocationConfirm(location.code))) {
      return;
    }
    await deleteLocation(location.id);
    if (selectedWarehouse) {
      await loadLocations(selectedWarehouse);
      await loadWarehouses(meta.page, search);
    }
  };

  return (
    <div>
      <PageHeader
        title={NAV.warehouses}
        description={WAREHOUSES.description}
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditingWarehouse(null);
                setWarehouseModalOpen(true);
              }}
            >
              {WAREHOUSES.addWarehouse}
            </Button>
          ) : undefined
        }
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{WAREHOUSES.warehouseSection}</h2>

        <form onSubmit={handleSearch} className={tableStyles.searchBar}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={WAREHOUSES.searchPlaceholder}
            className={tableStyles.searchInput}
          />
          <Button type="submit" variant="secondary">
            {COMMON.search}
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
                  <th>{COMMON.warehouseCode}</th>
                  <th>{COMMON.warehouse}</th>
                  <th>{COMMON.address}</th>
                  <th>{WAREHOUSES.locationCount}</th>
                  <th>{COMMON.status}</th>
                  {isAdmin && <th>{COMMON.actions}</th>}
                </tr>
              </thead>
              <tbody>
                {warehouses.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className={tableStyles.empty}>
                      {WAREHOUSES.empty}
                    </td>
                  </tr>
                ) : (
                  warehouses.map((warehouse) => (
                    <tr
                      key={warehouse.id}
                      className={
                        selectedWarehouse?.id === warehouse.id ? styles.selectedRow : styles.clickableRow
                      }
                      onClick={() => handleSelectWarehouse(warehouse)}
                    >
                      <td>{warehouse.code}</td>
                      <td>{warehouse.name}</td>
                      <td>{warehouse.address ?? '-'}</td>
                      <td>{warehouse.locationCount}</td>
                      <td>
                        <span
                          className={
                            warehouse.isActive ? styles.badgeActive : styles.badgeInactive
                          }
                        >
                          {warehouse.isActive ? COMMON.active : COMMON.inactive}
                        </span>
                      </td>
                      {isAdmin && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className={tableStyles.actions}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingWarehouse(warehouse);
                                setWarehouseModalOpen(true);
                              }}
                            >
                              {COMMON.edit}
                            </Button>
                            {warehouse.isActive && (
                              <Button
                                variant="ghostDanger"
                                size="sm"
                                onClick={() => handleDeleteWarehouse(warehouse)}
                              >
                                {COMMON.delete}
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className={tableStyles.pagination}>
            <Button
              variant="secondary"
              disabled={meta.page <= 1}
              onClick={() => loadWarehouses(meta.page - 1, search)}
            >
              {COMMON.prev}
            </Button>
            <span>
              {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={meta.page >= meta.totalPages}
              onClick={() => loadWarehouses(meta.page + 1, search)}
            >
              {COMMON.next}
            </Button>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.locationHeader}>
          <h2 className={styles.sectionTitle}>
            {selectedWarehouse
              ? WAREHOUSES.locationSection(selectedWarehouse.name)
              : WAREHOUSES.locationsTitle}
          </h2>
          {isAdmin && selectedWarehouse?.isActive && (
            <Button
              size="sm"
              onClick={() => {
                setEditingLocation(null);
                setLocationModalOpen(true);
              }}
            >
              {WAREHOUSES.addLocation}
            </Button>
          )}
        </div>

        {!selectedWarehouse ? (
          <p className={styles.hint}>{WAREHOUSES.selectWarehouse}</p>
        ) : locationsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {locationsError && <div className={tableStyles.error}>{locationsError}</div>}
            <div className={tableStyles.tableWrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>{COMMON.locationCode}</th>
                    <th>{COMMON.locationName}</th>
                    <th>{WAREHOUSES.inventoryLinked}</th>
                    {isAdmin && <th>{COMMON.actions}</th>}
                  </tr>
                </thead>
                <tbody>
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 3} className={tableStyles.empty}>
                        {WAREHOUSES.locationsEmpty}
                      </td>
                    </tr>
                  ) : (
                    locations.map((location) => (
                      <tr key={location.id}>
                        <td>{location.code}</td>
                        <td>{location.name ?? '-'}</td>
                        <td>{location.inventoryCount > 0 ? COMMON.active : COMMON.none}</td>
                        {isAdmin && (
                          <td>
                            <div className={tableStyles.actions}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingLocation(location);
                                  setLocationModalOpen(true);
                                }}
                              >
                                {COMMON.edit}
                              </Button>
                              <Button
                                variant="ghostDanger"
                                size="sm"
                                disabled={location.inventoryCount > 0}
                                onClick={() => handleDeleteLocation(location)}
                              >
                                {COMMON.delete}
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {warehouseModalOpen && (
        <WarehouseFormModal
          warehouse={editingWarehouse}
          onClose={() => {
            setWarehouseModalOpen(false);
            setEditingWarehouse(null);
          }}
          onSave={handleSaveWarehouse}
        />
      )}

      {locationModalOpen && selectedWarehouse && (
        <LocationFormModal
          location={editingLocation}
          onClose={() => {
            setLocationModalOpen(false);
            setEditingLocation(null);
          }}
          onSave={handleSaveLocation}
        />
      )}
    </div>
  );
}
